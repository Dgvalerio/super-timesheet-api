import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Appointment } from '@/appointment/appointment.entity';
import { CreateAppointmentDto } from '@/appointment/dto/create-appointment.dto';
import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';
import { UpdateAppointmentDto } from '@/appointment/dto/update-appointment.dto';
import { CategoryService } from '@/category/category.service';
import { formatMinutesToTime, getNow } from '@/common/helpers/today';
import { ProjectService } from '@/project/project.service';
import { UserService } from '@/user/user.service';

import {
  areIntervalsOverlapping,
  compareAsc,
  format,
  isToday,
  set,
  intervalToDuration,
  add,
  endOfMonth,
  differenceInMinutes,
} from 'date-fns';
import { Between, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private userService: UserService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
  ) {}

  async createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
    const now = getNow();

    now.setSeconds(0);
    now.setMilliseconds(0);

    const toDate = (time: string): Date => {
      const [hours, minutes] = time.split(':');

      return set(data.date, { hours: Number(hours), minutes: Number(minutes) });
    };

    // Validations
    // Today validations
    if (isToday(data.date)) {
      const today = format(getNow(), 'yyyy-MM-dd');

      const startDate = `${today}T${data.startTime}:00.000Z`;
      const endDate = `${today}T${data.endTime}:00.000Z`;

      if (compareAsc(new Date(startDate), now) >= 0) {
        throw new BadRequestException(
          'O horário inicial precisa ser menor que o atual',
        );
      }

      if (compareAsc(new Date(startDate), new Date(endDate)) >= 0) {
        throw new BadRequestException(
          'O horário inicial precisa ser menor que o final',
        );
      }

      if (compareAsc(new Date(endDate), now) > 0) {
        throw new BadRequestException(
          'O horário final não deve ser maior que o atual',
        );
      }
    }

    // Verify overlapping
    const appointmentsWithTheSameDay = await this.getAllAppointments({
      user: { id: data.userId },
      date: data.date,
    });

    const timeConflict = appointmentsWithTheSameDay.find(
      ({ startTime, endTime }) =>
        areIntervalsOverlapping(
          {
            start: toDate(startTime),
            end: add(toDate(endTime), { minutes: 1 }),
          },
          {
            start: toDate(data.startTime),
            end: add(toDate(data.endTime), { minutes: 1 }),
          },
        ),
    );

    if (timeConflict) {
      throw new ConflictException('Esse horário já foi utilizado!');
    }

    // Verify duration
    const duration = intervalToDuration({
      start: toDate(data.startTime),
      end: toDate(data.endTime),
    });

    if (duration.hours === 0 && duration.minutes === 0) {
      throw new BadRequestException('A duração deve ser maior que 1 minuto!');
    }

    // Verify code conflict
    if (data.code) {
      const haveCodeConflict = await this.getAppointment({ code: data.code });

      if (haveCodeConflict) {
        throw new ConflictException('Esse código já foi utilizado!');
      }
    }

    // User
    const user = await this.userService.getUser({ id: data.userId });

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    // Project
    const project = await this.projectService.getProject({
      id: data.projectId,
      code: data.projectCode,
    });

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    // Category
    const category = await this.categoryService.getCategory({
      id: data.categoryId,
      code: data.categoryCode,
      name: data.categoryName,
    });

    if (!category) {
      throw new NotFoundException('A categoria informada não existe!');
    }

    if (!project.categories.find(({ id }) => category.id === id)) {
      throw new NotFoundException(
        'A categoria informada não existe nesse projeto!',
      );
    }

    const created = this.appointmentRepository.create({
      ...data,
      user,
      project,
      category,
    });
    const saved = await this.appointmentRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar um apontamento',
      );
    }

    return this.getAppointment({ id: saved.id });
  }

  async getAppointment(
    params: FindOneOptions<Appointment>['where'],
  ): Promise<Appointment | null> {
    const options: FindOneOptions<Appointment> = {
      relations: {
        user: true,
        project: { client: true },
        category: true,
      },
    };

    if (params) options.where = { ...params };
    else throw new BadRequestException('Nenhum parâmetro válido foi informado');

    return this.appointmentRepository.findOne(options);
  }

  async getAllAppointments(
    params: FindOptionsWhere<Appointment & { month?: Appointment['date'] }>,
  ): Promise<Appointment[]> {
    const options: FindManyOptions<Appointment> = {
      relations: {
        user: true,
        project: { client: true },
        category: true,
      },
      order: {
        date: 'desc',
        startTime: 'desc',
        endTime: 'desc',
      },
    };

    if (params) {
      if (params.month) {
        const { month, ...others } = params;

        const first = set(month as Date, {
          date: 1,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        });
        const last = endOfMonth(first);

        options.where = { ...others, date: Between<Date>(first, last) };
      } else options.where = { ...params };
    }

    return this.appointmentRepository.find(options);
  }

  async updateAppointment(input: UpdateAppointmentDto): Promise<Appointment> {
    const newData: Partial<Appointment> = {};
    const appointment = await this.getAppointment({ id: input.id });

    if (!appointment) {
      throw new NotFoundException('O apontamento informado não existe!');
    }

    const now = getNow();

    now.setSeconds(0);
    now.setMilliseconds(0);

    if (input.code && input.code !== appointment.code) {
      const haveCodeConflict = await this.getAppointment({ code: input.code });

      if (haveCodeConflict) {
        throw new ConflictException('Esse código já foi utilizado!');
      }

      newData.code = input.code;
    }

    // User
    if (input.userId && input.userId !== appointment.user.id) {
      const user = await this.userService.getUser({ id: input.userId });

      if (!user) {
        throw new NotFoundException('O usuário informado não existe!');
      }

      newData.user = user;
    }

    // Project
    if (
      (input.projectId && input.projectId !== appointment.project.id) ||
      (input.projectCode && input.projectCode !== appointment.project.code)
    ) {
      const project = await this.projectService.getProject({
        id: input.projectId,
        code: input.projectCode,
      });

      if (!project) {
        throw new NotFoundException('O projeto informado não existe!');
      }

      newData.project = project;
    }

    // Category
    if (
      (input.categoryId && input.categoryId !== appointment.category.id) ||
      (input.categoryCode &&
        input.categoryCode !== appointment.category.code) ||
      (input.categoryName && input.categoryName !== appointment.category.name)
    ) {
      const category = await this.categoryService.getCategory({
        id: input.categoryId,
        code: input.categoryCode,
        name: input.categoryName,
      });

      if (!category) {
        throw new NotFoundException('A categoria informada não existe!');
      }

      newData.category = category;
    }

    if (input.date && input.date !== appointment.date) {
      newData.date = input.date;
    }

    if (input.startTime && input.startTime !== appointment.startTime) {
      newData.startTime = input.startTime;
    }

    if (input.endTime && input.endTime !== appointment.endTime) {
      newData.endTime = input.endTime;
    }

    if (
      typeof input.notMonetize === 'boolean' &&
      input.notMonetize !== appointment.notMonetize
    ) {
      newData.notMonetize = input.notMonetize;
    }

    if (input.description && input.description !== appointment.description) {
      newData.description = input.description;
    }

    if (input.commit && input.commit !== appointment.commit) {
      newData.commit = input.commit;
    }

    if (input.status && input.status !== appointment.status) {
      newData.status = input.status;
    }

    if (Object.keys(newData).length === 0) {
      return appointment;
    }

    if (newData.startTime || newData.endTime || newData.date) {
      const startTime = newData.startTime || appointment.startTime;
      const endTime = newData.endTime || appointment.endTime;
      const date = newData.date || appointment.date;

      // Validations
      if (isToday(date)) {
        const today = format(getNow(), 'yyyy-MM-dd');

        const startDate = `${today}T${startTime}:00.000Z`;
        const endDate = `${today}T${endTime}:00.000Z`;

        if (compareAsc(new Date(startDate), now) >= 0) {
          throw new BadRequestException(
            'O horário inicial precisa ser menor que o atual',
          );
        }

        if (compareAsc(new Date(startDate), new Date(endDate)) >= 0) {
          throw new BadRequestException(
            'O horário inicial precisa ser menor que o final',
          );
        }

        if (compareAsc(new Date(endDate), now) > 0) {
          throw new BadRequestException(
            'O horário final não deve ser maior que o atual',
          );
        }
      }
    }

    await this.appointmentRepository.update(appointment, { ...newData });

    const saved = await this.appointmentRepository.save({
      ...appointment,
      ...newData,
    });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao atualizar um apontamento',
      );
    }

    return this.getAppointment({ id: input.id });
  }

  async deleteAppointment(input: DeleteAppointmentInput): Promise<boolean> {
    const appointment = await this.getAppointment(input);

    if (!appointment) {
      throw new NotFoundException('O apontamento informado não existe!');
    }

    const deleted = await this.appointmentRepository.delete(appointment.id);

    return !!deleted;
  }

  async getCurrentMonthWorkedTime(
    params: Pick<FindOptionsWhere<Appointment>, 'user'>,
  ): Promise<string> {
    const first = set(new Date(), {
      date: 1,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const last = endOfMonth(first);

    const options: FindManyOptions<Appointment> = {
      where: { ...params, date: Between<Date>(first, last) },
      relations: { user: true, project: { client: true }, category: true },
    };

    const appointments = await this.appointmentRepository.find(options);

    const workedMinutes = appointments.reduce(
      (previousValue, { date, startTime, endTime }) => {
        const simpleDate = format(new Date(date), 'yyyy-MM-dd');

        return (
          previousValue +
          differenceInMinutes(
            new Date(`${simpleDate}T${endTime}`),
            new Date(`${simpleDate}T${startTime}`),
          )
        );
      },
      0,
    );

    return formatMinutesToTime(workedMinutes);
  }
}
