import { InputType } from '@nestjs/graphql';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

@InputType()
export class UpdateAzureInfosInput implements Partial<AzureInfos> {
  @IsString()
  @IsNotEmpty()
  id: AzureInfos['id'];

  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  login?: AzureInfos['login'];

  @Matches(/\d+:\d+/)
  @IsOptional()
  @IsNotEmpty()
  currentMonthWorkedTime?: AzureInfos['currentMonthWorkedTime'];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password?: string;
}
