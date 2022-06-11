import { InputType } from '@nestjs/graphql';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetAzureInfosInput implements Partial<AzureInfos> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: AzureInfos['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  login?: AzureInfos['login'];
}
