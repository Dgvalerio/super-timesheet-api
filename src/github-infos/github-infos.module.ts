import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GithubInfos } from '@/github-infos/github-infos.entity';
import { GithubInfosResolver } from '@/github-infos/github-infos.resolver';
import { GithubInfosService } from '@/github-infos/github-infos.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([GithubInfos])],
  providers: [GithubInfosService, GithubInfosResolver],
  exports: [GithubInfosService],
})
export class GithubInfosModule {}
