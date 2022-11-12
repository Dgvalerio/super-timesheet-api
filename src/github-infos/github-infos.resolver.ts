import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { CreateGithubInfosInput } from '@/github-infos/dto/create-github-infos.input';
import { GithubInfos } from '@/github-infos/github-infos.entity';
import { GithubInfosService } from '@/github-infos/github-infos.service';
import { User } from '@/user/user.entity';

import { IncomingMessage } from 'http';

@Resolver()
export class GithubInfosResolver {
  constructor(private githubInfosService: GithubInfosService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GithubInfos)
  async createGithubInfos(
    @Context() { req }: { req: IncomingMessage & { user: User } },
    @Args('input') input: CreateGithubInfosInput,
  ): Promise<GithubInfos> {
    return this.githubInfosService.createGithubInfos({
      userId: req.user.id,
      ...input,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => GithubInfos)
  async getGithubInfos(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<GithubInfos> {
    const githubInfos = await this.githubInfosService.getGithubInfos({
      user: { id: req.user.id },
    });

    if (!githubInfos) {
      throw new NotFoundException('Nenhuma informação foi encontrada');
    }

    return githubInfos;
  }
}
