import { Module } from '@nestjs/common';

import { GithubInfosResolver } from '@/github-infos/github-infos.resolver';
import { GithubInfosService } from '@/github-infos/github-infos.service';

@Module({
  providers: [GithubInfosService, GithubInfosResolver],
})
export class GithubInfosModule {}
