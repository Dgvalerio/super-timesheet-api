import { InputType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';
import { today } from '@/common/helpers/today';

import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
} from 'class-validator';

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

  @IsDate()
  @IsNotEmpty()
  @MaxDate(today(), {
    message: ({ constraints }) =>
      `The date must not go beyond today (${constraints[0].toISOString()})`,
  })
  @IsOptional()
  date?: Appointment['date'];
}
