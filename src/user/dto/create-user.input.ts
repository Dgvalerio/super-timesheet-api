import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsString()
  @IsNotEmpty()
  name: User['name'];

  @IsEmail()
  @IsNotEmpty()
  email: User['email'];

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(24)
  dailyHours: User['dailyHours'];

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: User['password'];

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  passwordConfirmation: User['password'];
}
