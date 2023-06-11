import { InputType } from '@nestjs/graphql';

import { RepositoryGroup } from '@/github/repository-group/repository-group.entity';

import { IsArray, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateRepositoryGroupInput {
  @IsString()
  @IsNotEmpty()
  name: RepositoryGroup['name'];

  @IsArray()
  @IsNotEmpty()
  repositories: RepositoryGroup['repositories'];
}
