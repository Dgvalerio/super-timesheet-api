import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetUserInput {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: User['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: User['name'];

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: User['email'];
}
