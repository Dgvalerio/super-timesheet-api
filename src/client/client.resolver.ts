import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Client } from '@/client/client.entity';
import { ClientService } from '@/client/client.service';
import { CreateClientInput } from '@/client/dto/create.client.input';

@Resolver()
export class ClientResolver {
  constructor(private clientService: ClientService) {}

  @Mutation(() => Client)
  async createClient(@Args('input') input: CreateClientInput): Promise<Client> {
    return this.clientService.createClient(input);
  }

  @Query(() => [Client])
  async getAllClients(): Promise<Client[]> {
    return this.clientService.findAllClients();
  }
}
