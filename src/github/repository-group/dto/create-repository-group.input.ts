import { InputType } from '@nestjs/graphql';

import { GithubInfos } from '@/github-infos/github-infos.entity';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateRepositoryGroupInput {
  @IsString()
  @IsNotEmpty()
  access_token: GithubInfos['access_token'];
}
