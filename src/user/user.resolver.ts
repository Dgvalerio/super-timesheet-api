import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { CreateUserInput } from '@/user/dto/create-user.input';
import { DeleteUserInput } from '@/user/dto/delete-user.input';
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

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async getUser(@Args('input') input: GetUserInput): Promise<User> {
    const user = await this.userService.getUser(input);

    if (!user) {
      throw new NotFoundException('Nenhum usuário foi encontrado');
    }

    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteUser(@Args('input') input: DeleteUserInput): Promise<boolean> {
    return this.userService.deleteUser(input);
  }
}
