import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: User['name'];

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: User['email'];

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(24)
  @IsOptional()
  dailyHours?: User['dailyHours'];

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: User['password'];

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @IsOptional()
  newPassword?: User['password'];

  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.newPassword)
  @IsNotEmpty()
  newPasswordConfirmation?: User['password'];
}
