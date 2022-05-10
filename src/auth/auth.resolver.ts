import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from '@/auth/auth.service';
import { AuthInput } from '@/auth/dto/auth.input';
import { AuthOutput } from '@/auth/dto/auth.output';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthOutput)
  async login(@Args('input') input: AuthInput): Promise<AuthOutput> {
    return this.authService.validateUser(input);
  }
}
