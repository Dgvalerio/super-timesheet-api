import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GithubInfosModule } from '@/github-infos/github-infos.module';
import { RepositoryGroup } from '@/github/repository-group/repository-group.entity';
import { RepositoryGroupResolver } from '@/github/repository-group/repository-group.resolver';
import { RepositoryGroupService } from '@/github/repository-group/repository-group.service';

@Module({
  imports: [GithubInfosModule, TypeOrmModule.forFeature([RepositoryGroup])],
  providers: [RepositoryGroupService, RepositoryGroupResolver],
  exports: [RepositoryGroupService],
})
export class RepositoryGroupModule {}
