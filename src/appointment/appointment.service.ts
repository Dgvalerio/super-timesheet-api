import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { CreateAppointmentDto } from '@/appointment/dto/create-appointment.dto';
import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';
import { GetAppointmentInput } from '@/appointment/dto/get-appointment.input';
import { UpdateAppointmentInput } from '@/appointment/dto/update-appointment.input';
import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { CategoryService } from '@/category/category.service';
import { getNow } from '@/common/helpers/today';
import { ProjectService } from '@/project/project.service';
import { SaveAppointmentOutput } from '@/scrapper/dto/save-appointment.output';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { UserService } from '@/user/user.service';

import {
  areIntervalsOverlapping,
  compareAsc,
  format,
  isToday,
  set,
} from 'date-fns';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private userService: UserService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private scrapperService: ScrapperService,
  ) {}

  async createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
    const now = getNow();

    now.setSeconds(0);
    now.setMilliseconds(0);

    // Validations
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

    const appointmentsWithTheSameDay = await this.getAllAppointments({
      date: data.date,
    });

    const toDate = (time: string): Date => {
      const [hours, minutes] = time.split(':');

      return set(data.date, { hours: Number(hours), minutes: Number(minutes) });
    };

    const timeConflict = appointmentsWithTheSameDay.find(
      ({ startTime, endTime }) =>
        areIntervalsOverlapping(
          { start: toDate(startTime), end: toDate(endTime) },
          { start: toDate(data.startTime), end: toDate(data.endTime) },
        ),
    );

    if (timeConflict) {
      throw new ConflictException('Esse horário já foi utilizado!');
    }

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
    params: GetAppointmentInput,
  ): Promise<Appointment | null> {
    const options: FindOneOptions<Appointment> = {
      where: {},
      relations: {
        user: true,
        project: { client: true },
        category: true,
      },
    };

    if (params.id) {
      options.where = { id: params.id };
    } else if (params.code) {
      options.where = { code: params.code };
    } else {
      throw new BadRequestException('Nenhum parâmetro válido foi informado');
    }

    return this.appointmentRepository.findOne(options);
  }

  async getAllAppointments(
    params: FindOptionsWhere<Appointment>,
  ): Promise<Appointment[]> {
    const options: FindManyOptions<Appointment> = {
      relations: {
        user: true,
        project: { client: true },
        category: true,
      },
    };

    if (params) {
      options.where = { ...params };
    }

    return this.appointmentRepository.find(options);
  }

  async updateAppointment(input: UpdateAppointmentInput): Promise<Appointment> {
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
    if (
      (input.userId && input.userId !== appointment.user.id) ||
      (input.userEmail && input.userEmail !== appointment.user.email)
    ) {
      const user = await this.userService.getUser({
        id: input.userId,
        email: input.userEmail,
      });

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

  async sendAppointments(
    azureInfos: AzureInfos,
  ): Promise<SaveAppointmentOutput[]> {
    const appointments = await this.getAllAppointments({
      status: AppointmentStatus.Draft,
    });

    if (appointments.length <= 0) return [];

    const saveAppointmentOutputs = await this.scrapperService.saveAppointments({
      azureInfos,
      appointments,
    });

    if (saveAppointmentOutputs.length <= 0) return saveAppointmentOutputs;

    const promise = saveAppointmentOutputs.map(async (output) => {
      const { appointment } = output;

      const updated = await this.updateAppointment({
        id: appointment.id,
        code: appointment.code,
        status: appointment.status,
        commit: appointment.commit,
      });

      return { ...output, appointment: updated };
    });

    return await Promise.all(promise);
  }
}
