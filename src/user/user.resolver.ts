import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserInput } from '@/user/dto/create-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.userService.createUser(input);
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Query(() => User)
  async getUser(@Args('input') input: GetUserInput): Promise<User> {
    return this.userService.getUser(input);
  }
}
