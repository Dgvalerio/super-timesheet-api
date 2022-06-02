import { InputType } from '@nestjs/graphql';

import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { Category } from '@/category/category.entity';
import { today } from '@/common/helpers/today';
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
  MaxDate,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateAppointmentInput implements Partial<Appointment> {
  @IsString()
  @IsOptional()
  code?: Appointment['code'];

  @IsDate()
  @IsNotEmpty()
  @MaxDate(today(), {
    message: ({ constraints }) =>
      `The date must not go beyond today (${constraints[0].toISOString()})`,
  })
  date: Appointment['date'];

  @IsMilitaryTime()
  @IsNotEmpty()
  startTime: Appointment['startTime'];

  @IsMilitaryTime()
  @IsNotEmpty()
  endTime: Appointment['endTime'];

  @IsBoolean()
  @IsNotEmpty()
  notMonetize: Appointment['notMonetize'];

  @IsString()
  @IsNotEmpty()
  description: Appointment['description'];

  @IsString()
  @IsOptional()
  commit?: Appointment['commit'];

  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: Appointment['status'];

  // Relations
  // User
  @IsString()
  @ValidateIf((o) => !o.userEmail)
  @IsNotEmpty()
  userId?: User['id'];

  @IsEmail()
  @ValidateIf((o) => !o.userId)
  @IsNotEmpty()
  userEmail?: User['email'];

  // Project
  @IsString()
  @ValidateIf((o) => !o.projectCode)
  @IsNotEmpty()
  projectId?: Project['id'];

  @IsString()
  @ValidateIf((o) => !o.projectId)
  @IsNotEmpty()
  projectCode?: Project['code'];

  // Category
  @IsString()
  @ValidateIf((o) => !o.categoryName && !o.categoryCode)
  @IsNotEmpty()
  categoryId?: Category['id'];

  @IsString()
  @ValidateIf((o) => !o.categoryId && !o.categoryCode)
  @IsNotEmpty()
  categoryName?: Category['name'];

  @IsString()
  @ValidateIf((o) => !o.categoryId && !o.categoryName)
  @IsNotEmpty()
  categoryCode?: Category['code'];
}
