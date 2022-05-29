import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Appointment } from '@/appointment/appointment.entity';
import { CreateAppointmentInput } from '@/appointment/dto/create-appointment.input';
import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';
import { GetAppointmentInput } from '@/appointment/dto/get-appointment.input';
import { UpdateAppointmentInput } from '@/appointment/dto/update-appointment.input';
import { CategoryService } from '@/category/category.service';
import { ProjectService } from '@/project/project.service';
import { UserService } from '@/user/user.service';

import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private userService: UserService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
  ) {}

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    if (input.code) {
      const haveCodeConflict = await this.getAppointment({ code: input.code });

      if (haveCodeConflict) {
        throw new ConflictException('Esse código já foi utilizado!');
      }
    }

    // User
    const user = await this.userService.getUser({
      id: input.userId,
      email: input.userEmail,
    });

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    // Project
    const project = await this.projectService.getProject({
      id: input.projectId,
      code: input.projectCode,
    });

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    // Category
    const category = await this.categoryService.getCategory({
      id: input.categoryId,
      code: input.categoryCode,
      name: input.categoryName,
    });

    if (!category) {
      throw new NotFoundException('A categoria informada não existe!');
    }

    const created = this.appointmentRepository.create({
      ...input,
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
      relations: { user: true, project: true, category: true },
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
    params: GetAppointmentInput,
  ): Promise<Appointment[]> {
    const options: FindManyOptions<Appointment> = {
      where: {},
      relations: { user: true, project: true, category: true },
    };

    if (params.id) {
      options.where = { id: params.id };
    } else if (params.code) {
      options.where = { code: params.code };
    } else {
      delete options.where;
    }

    return this.appointmentRepository.find(options);
  }

  async updateAppointment(input: UpdateAppointmentInput): Promise<Appointment> {
    const newData: Partial<Appointment> = {};
    const appointment = await this.getAppointment({ id: input.id });

    if (!appointment) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    if (input.code) {
      const haveCodeConflict = await this.getAppointment({ code: input.code });

      if (haveCodeConflict) {
        throw new ConflictException('Esse código já foi utilizado!');
      }
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

    if (input.notMonetize && input.notMonetize !== appointment.notMonetize) {
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
}
