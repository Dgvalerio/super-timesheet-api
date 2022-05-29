import { InputType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetAppointmentInput implements Partial<Appointment> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: Appointment['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: Appointment['code'];
}
