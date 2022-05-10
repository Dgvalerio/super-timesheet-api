import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class AuthInput {
  @IsEmail()
  @IsNotEmpty()
  email: User['email'];

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: User['password'];
}
