import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { ContextWithUser } from '@/common/interfaces/context-with-user';
import { CreateRepositoryGroupInput } from '@/github/repository-group/dto/create-repository-group.input';
import { RepositoryGroup } from '@/github/repository-group/repository-group.entity';
import { RepositoryGroupService } from '@/github/repository-group/repository-group.service';

@Resolver()
export class RepositoryGroupResolver {
  constructor(private repositoryGroupService: RepositoryGroupService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RepositoryGroup)
  async createRepositoryGroup(
    @Context() { req }: ContextWithUser,
    @Args('input') input: CreateRepositoryGroupInput
  ): Promise<RepositoryGroup> {
    return this.repositoryGroupService.createRepositoryGroup({
      githubInfosId: req.user.githubInfos.id,
      ...input,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => RepositoryGroup)
  async getRepositoryGroup(
    @Context() { req }: ContextWithUser,
    @Args('name') name: string
  ): Promise<RepositoryGroup> {
    const repositoryGroup =
      await this.repositoryGroupService.getRepositoryGroup({
        name,
        githubInfos: { id: req.user.githubInfos.id },
      });

    if (!repositoryGroup) {
      throw new NotFoundException('Nenhum grupo foi encontrado');
    }

    return repositoryGroup;
  }
}
