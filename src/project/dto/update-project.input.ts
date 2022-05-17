import { InputType } from '@nestjs/graphql';

import { Client } from '@/client/client.entity';
import { Project } from '@/project/project.entity';

import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateProjectInput implements Partial<Project> {
  @IsString()
  @IsNotEmpty()
  id: Project['id'];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  code?: Project['code'];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: Project['name'];

  @IsDate()
  @IsOptional()
  @IsNotEmpty()
  startDate?: Project['startDate'];

  @IsDate()
  @IsOptional()
  @IsNotEmpty()
  endDate?: Project['endDate'];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  clientId?: Client['id'];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  clientCode?: Client['code'];
}
