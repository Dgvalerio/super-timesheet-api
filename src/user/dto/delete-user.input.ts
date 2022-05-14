import { InputType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

@InputType()
export class DeleteUserInput implements Partial<User> {
  @IsString()
  @ValidateIf((o) => !o.email)
  @IsNotEmpty()
  id?: User['id'];

  @IsEmail()
  @ValidateIf((o) => !o.id)
  @IsNotEmpty()
  email?: User['email'];
}
