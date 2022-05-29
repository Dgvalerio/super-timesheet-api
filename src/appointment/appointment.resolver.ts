import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';
import { AppointmentService } from '@/appointment/appointment.service';
import { CreateAppointmentInput } from '@/appointment/dto/create-appointment.input';
import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';
import { GetAppointmentInput } from '@/appointment/dto/get-appointment.input';
import { UpdateAppointmentInput } from '@/appointment/dto/update-appointment.input';
import { GqlAuthGuard } from '@/auth/auth.guard';

@Resolver()
export class AppointmentResolver {
  constructor(private appointmentService: AppointmentService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Appointment)
  async createAppointment(
    @Args('input') input: CreateAppointmentInput,
  ): Promise<Appointment> {
    return this.appointmentService.createAppointment(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Appointment])
  async getAllAppointments(): Promise<Appointment[]> {
    return this.appointmentService.getAllAppointments({});
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Appointment)
  async getAppointment(
    @Args('input') input: GetAppointmentInput,
  ): Promise<Appointment> {
    const appointment = await this.appointmentService.getAppointment(input);

    if (!appointment) {
      throw new NotFoundException('Nenhum apontamento foi encontrado');
    }

    return appointment;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Appointment)
  async updateAppointment(
    @Args('input') input: UpdateAppointmentInput,
  ): Promise<Appointment> {
    return this.appointmentService.updateAppointment(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteAppointment(
    @Args('input') input: DeleteAppointmentInput,
  ): Promise<boolean> {
    return this.appointmentService.deleteAppointment(input);
  }
}
