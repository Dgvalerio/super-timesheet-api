import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetUserInput implements Partial<User> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: User['id'];

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email?: User['email'];
}
