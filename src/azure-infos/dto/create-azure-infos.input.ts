import { InputType } from '@nestjs/graphql';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateAzureInfosInput {
  @IsEmail()
  @IsNotEmpty()
  login: AzureInfos['login'];

  @IsString()
  @IsNotEmpty()
  password: string;
}
