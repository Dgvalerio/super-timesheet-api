import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Resolver, Subscription } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { AuthService } from '@/auth/auth.service';
import { SeedOutput } from '@/scrapper/dto/seed.output';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { SeedService } from '@/scrapper/seed.service';
import { User } from '@/user/user.entity';

import { PubSub } from 'graphql-subscriptions';
import { IncomingMessage } from 'http';

@Resolver()
export class ScrapperResolver {
  constructor(
    private scrapperService: ScrapperService,
    private seedService: SeedService,
    private pubSub: PubSub,
    private authService: AuthService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async updateData(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<boolean> {
    return await this.scrapperService.update({ user: req.user });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async importData(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<boolean> {
    await this.seedService.importUserData(req.user);

    return true;
  }

  @Subscription(() => SeedOutput, {
    filter(
      this: ScrapperResolver,
      payload: { watchImportData: SeedOutput },
      variables,
      context,
    ) {
      const token = context.token || context.Authorization.split(` `)[1];
      const userId = this.authService.decodeToken(token);

      return payload.watchImportData.userId === userId;
    },
  })
  watchImportData(): AsyncIterator<SeedOutput> {
    return this.pubSub.asyncIterator<SeedOutput>('watchImportData');
  }
}
