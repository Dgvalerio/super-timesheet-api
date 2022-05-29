import { InputType } from '@nestjs/graphql';

import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { Category } from '@/category/category.entity';
import { Project } from '@/project/project.entity';
import { User } from '@/user/user.entity';

import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateAppointmentInput implements Partial<Appointment> {
  @IsString()
  @IsNotEmpty()
  id: Appointment['id'];

  @IsString()
  @IsOptional()
  code?: Appointment['code'];

  @IsDate()
  @IsNotEmpty()
  @IsOptional()
  date?: Appointment['date'];

  @IsMilitaryTime()
  @IsNotEmpty()
  @IsOptional()
  startTime?: Appointment['startTime'];

  @IsMilitaryTime()
  @IsNotEmpty()
  @IsOptional()
  endTime?: Appointment['endTime'];

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  notMonetize?: Appointment['notMonetize'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: Appointment['description'];

  @IsString()
  @IsOptional()
  commit?: Appointment['commit'];

  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  @IsOptional()
  status?: Appointment['status'];

  // Relations
  // User
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userId?: User['id'];

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  userEmail?: User['email'];

  // Project
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  projectId?: Project['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  projectCode?: Project['code'];

  // Category
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryId?: Category['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryName?: Category['name'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryCode?: Category['code'];
}
