import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@/client/client.entity';
import { CreateClientInput } from '@/client/dto/create-client.input';
import { GetClientInput } from '@/client/dto/get-client.input';

import { Repository } from 'typeorm';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async createClient(input: CreateClientInput): Promise<Client> {
    const conflicting = await this.getClient({ name: input.name });

    if (conflicting) {
      throw new ConflictException('Esse nome já foi utilizado!');
    }

    if (input.code) {
      const haveCodeConflict = await this.getClient({ code: input.code });

      if (haveCodeConflict) {
        throw new ConflictException('Esse código já foi utilizado!');
      }
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

  async getAllClients(): Promise<Client[]> {
    return this.clientRepository.find();
  }

  async getClient(params: GetClientInput): Promise<Client> {
    let search = {};

    if (params.id) {
      search = { id: params.id };
    } else if (params.name) {
      search = { name: params.name };
    } else if (params.code) {
      search = { code: params.code };
    } else {
      throw new BadRequestException('Nenhum parâmetro válido foi informado');
    }

    return this.clientRepository.findOneBy(search);
  }
}
