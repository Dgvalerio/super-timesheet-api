import { InputType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';
import { AzureInfos } from '@/azure-infos/azure-infos.entity';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SaveAppointmentsInput {
  @IsEmail()
  @IsNotEmpty()
  login: AzureInfos['login'];

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  appointments: Appointment[];
}
