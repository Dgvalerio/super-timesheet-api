import { InputType } from '@nestjs/graphql';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';

import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

@InputType()
export class GetAzureInfosInput implements Partial<AzureInfos> {
  @IsString()
  @ValidateIf((o) => !o.login)
  @IsNotEmpty()
  id?: AzureInfos['id'];

  @IsEmail()
  @ValidateIf((o) => !o.id)
  @IsNotEmpty()
  login?: AzureInfos['login'];
}
