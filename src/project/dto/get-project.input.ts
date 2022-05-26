import { InputType } from '@nestjs/graphql';

import { Project } from '@/project/project.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetProjectInput implements Partial<Project> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: Project['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: Project['code'];
}
