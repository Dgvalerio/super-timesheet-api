import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserInput } from '@/user/dto/create-user.input';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('data') data: CreateUserInput): Promise<User> {
    return this.userService.createUser(data);
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }
}
