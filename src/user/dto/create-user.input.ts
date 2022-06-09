import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @IsString()
  @IsNotEmpty()
  name: User['name'];

  @IsEmail()
  @IsNotEmpty()
  email: User['email'];

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: User['password'];
}
