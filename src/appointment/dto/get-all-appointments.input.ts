import { InputType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetAllAppointmentsInput implements Partial<Appointment> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: Appointment['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: Appointment['code'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status?: Appointment['status'];
}
