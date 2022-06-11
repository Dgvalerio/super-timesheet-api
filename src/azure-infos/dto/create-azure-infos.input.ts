import { InputType } from '@nestjs/graphql';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

@InputType()
export class CreateAzureInfosInput {
  @IsEmail()
  @IsNotEmpty()
  login: AzureInfos['login'];

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @ValidateIf((o) => !o.userEmail)
  @IsNotEmpty()
  userId?: User['id'];

  @IsString()
  @ValidateIf((o) => !o.userId)
  @IsNotEmpty()
  userEmail?: User['email'];
}
