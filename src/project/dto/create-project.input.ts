import { InputType } from '@nestjs/graphql';

import { Client } from '@/client/client.entity';
import { Project } from '@/project/project.entity';

import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateProjectInput implements Partial<Project> {
  @IsString()
  @IsOptional()
  code?: Project['code'];

  @IsString()
  @IsNotEmpty()
  name: Project['name'];

  @IsDate()
  @IsNotEmpty()
  startDate: Project['startDate'];

  @IsDate()
  @IsNotEmpty()
  endDate: Project['endDate'];

  @IsString()
  @ValidateIf((o) => !o.clientCode)
  @IsNotEmpty()
  clientId?: Client['id'];

  @IsString()
  @ValidateIf((o) => !o.clientId)
  @IsNotEmpty()
  clientCode?: Client['code'];
}
