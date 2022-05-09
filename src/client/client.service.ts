import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@/client/client.entity';
import { CreateClientInput } from '@/client/dto/create-client.input';

import { Repository } from 'typeorm';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async createClient(input: CreateClientInput): Promise<Client> {
    const conflicting = await this.clientRepository.findBy({
      name: input.name,
    });

    if (conflicting.length > 0) {
      throw new ConflictException('Esse nome já foi utilizado!');
    }

    const created = await this.clientRepository.create(input);
    const saved = await this.clientRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar um cliente',
      );
    }

    return saved;
  }

  async findAllClients(): Promise<Client[]> {
    return this.clientRepository.find();
  }
}
