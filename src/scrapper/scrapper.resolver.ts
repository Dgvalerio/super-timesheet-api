import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { User } from '@/user/user.entity';

import { IncomingMessage } from 'http';

@Resolver()
export class ScrapperResolver {
  constructor(private scrapperService: ScrapperService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async updateData(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<boolean> {
    return await this.scrapperService.update({ user: req.user });
  }
}
