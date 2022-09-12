import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';

import { AuthService } from '@/auth/auth.service';
import { AuthVerifyService } from '@/scrapper/auth-verify/auth-verify.service';
import { AuthVerifyInput } from '@/scrapper/auth-verify/dto/auth-verify.input';
import {
  AuthVerifyOutput,
  WATCH_AUTH_VERIFY,
} from '@/scrapper/auth-verify/dto/auth-verify.output';
import { Seed } from '@/scrapper/dto/seed.types';

import { PubSub } from 'graphql-subscriptions';
import Cookie = Seed.Cookie;

@Resolver()
export class AuthVerifyResolver {
  constructor(
    private authVerifyService: AuthVerifyService,
    private pubSub: PubSub,
    private authService: AuthService,
  ) {}

  @Mutation(() => Boolean)
  async authVerify(@Args('input') input: AuthVerifyInput): Promise<Cookie[]> {
    return await this.authVerifyService.authVerify(input);
  }

  @Subscription(() => AuthVerifyOutput, {
    filter(
      this: AuthVerifyResolver,
      payload: { [WATCH_AUTH_VERIFY]: AuthVerifyOutput },
      variables,
      context,
    ) {
      const userId = this.authService.decodeToken(context.token);

      return payload[WATCH_AUTH_VERIFY].userId === userId;
    },
  })
  watchAuthVerify(): AsyncIterator<AuthVerifyOutput> {
    return this.pubSub.asyncIterator<AuthVerifyOutput>(WATCH_AUTH_VERIFY);
  }
}
