import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { Client } from '@/client/client.entity';
import { ClientService } from '@/client/client.service';
import { CreateClientInput } from '@/client/dto/create-client.input';
import { DeleteClientInput } from '@/client/dto/delete-client.input';
import { GetClientInput } from '@/client/dto/get-client.input';

@Resolver()
export class ClientResolver {
  constructor(private clientService: ClientService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Client)
  async createClient(@Args('input') input: CreateClientInput): Promise<Client> {
    return this.clientService.createClient(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Client])
  async getAllClients(): Promise<Client[]> {
    return this.clientService.getAllClients();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Client)
  async getClient(@Args('input') input: GetClientInput): Promise<Client> {
    const client = await this.clientService.getClient(input);

    if (!client) {
      throw new NotFoundException('Nenhum cliente foi encontrado');
    }

    return client;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteClient(
    @Args('input') input: DeleteClientInput,
  ): Promise<boolean> {
    return this.clientService.deleteClient(input);
  }
}
