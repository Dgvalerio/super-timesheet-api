import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Resolver, Subscription } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { AuthService } from '@/auth/auth.service';
import { ContextWithUser } from '@/common/interfaces/context-with-user';
import { SeedOutput, WATCH_IMPORT_DATA } from '@/scrapper/seed/dto/seed.output';
import { SeedService } from '@/scrapper/seed/seed.service';

import { PubSub } from 'graphql-subscriptions';

@Resolver()
export class SeedResolver {
  constructor(
    private seedService: SeedService,
    private pubSub: PubSub,
    private authService: AuthService
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async importData(@Context() { req }: ContextWithUser): Promise<boolean> {
    await this.seedService.importUserData(req.user);

    return true;
  }

  @Subscription(() => SeedOutput, {
    filter(this: SeedResolver, payload, variables, context) {
      const token = context.token || context.Authorization.split(` `)[1];
      const userId = this.authService.decodeToken(token);

      return payload[WATCH_IMPORT_DATA].userId === userId;
    },
  })
  [WATCH_IMPORT_DATA](): AsyncIterator<SeedOutput> {
    return this.pubSub.asyncIterator<SeedOutput>(WATCH_IMPORT_DATA);
  }
}
