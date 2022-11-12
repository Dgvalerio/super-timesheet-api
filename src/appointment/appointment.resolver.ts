import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';
import { AppointmentService } from '@/appointment/appointment.service';
import { CreateAppointmentInput } from '@/appointment/dto/create-appointment.input';
import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';
import { GetAllAppointmentsInput } from '@/appointment/dto/get-all-appointments.input';
import { GetAppointmentInput } from '@/appointment/dto/get-appointment.input';
import { UpdateAppointmentInput } from '@/appointment/dto/update-appointment.input';
import { GqlAuthGuard } from '@/auth/auth.guard';
import { ContextWithUser } from '@/common/interfaces/context-with-user';

@Resolver()
export class AppointmentResolver {
  constructor(private appointmentService: AppointmentService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Appointment)
  async createAppointment(
    @Context() { req }: ContextWithUser,
    @Args('input') input: CreateAppointmentInput
  ): Promise<Appointment> {
    return this.appointmentService.createAppointment({
      ...input,
      userId: req.user.id,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Appointment])
  async getAllAppointments(
    @Context() { req }: ContextWithUser,
    @Args('input') input: GetAllAppointmentsInput
  ): Promise<Appointment[]> {
    return this.appointmentService.getAllAppointments({
      ...input,
      user: { id: req.user.id },
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Appointment)
  async getAppointment(
    @Context() { req }: ContextWithUser,
    @Args('input') input: GetAppointmentInput
  ): Promise<Appointment> {
    const appointment = await this.appointmentService.getAppointment({
      ...input,
      user: { id: req.user.id },
    });

    if (!appointment) {
      throw new NotFoundException('Nenhum apontamento foi encontrado');
    }

    return appointment;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Appointment)
  async updateAppointment(
    @Context() { req }: ContextWithUser,
    @Args('input') input: UpdateAppointmentInput
  ): Promise<Appointment> {
    return this.appointmentService.updateAppointment({
      ...input,
      userId: req.user.id,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteAppointment(
    @Args('input') input: DeleteAppointmentInput
  ): Promise<boolean> {
    return this.appointmentService.deleteAppointment(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String)
  async getCurrentMonthWorkedTime(
    @Context() { req }: ContextWithUser
  ): Promise<string> {
    return this.appointmentService.getCurrentMonthWorkedTime({
      user: { id: req.user.id },
    });
  }
}
