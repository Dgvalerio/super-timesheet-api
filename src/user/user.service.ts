import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@/client/client.entity';
import { CreateUserInput } from '@/user/dto/create-user.input';
import { DeleteUserInput } from '@/user/dto/delete-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { User } from '@/user/user.entity';

import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    if (input.password !== input.passwordConfirmation) {
      throw new BadRequestException(
        'A confirmação de senha deve ser igual à senha!',
      );
    }

    const conflicting = await this.getUser({ email: input.email });

    if (conflicting) {
      throw new ConflictException('Esse email já foi utilizado!');
    }

    const created = this.userRepository.create({ ...input, projects: [] });
    const saved = await this.userRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar um usuário',
      );
    }

    return saved;
  }

  async getUser(params: GetUserInput): Promise<User | null> {
    let where = {};

    if (params.id) {
      where = { id: params.id };
    } else if (params.email) {
      where = { email: params.email };
    } else {
      throw new BadRequestException('Nenhum parâmetro válido foi informado');
    }

    return this.userRepository.findOne({
      where,
      relations: {
        projects: {
          categories: true,
          client: { projects: { categories: true } },
        },
        azureInfos: true,
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserClients(user: User): Promise<Client[]> {
    const { projects } = user;

    if (projects.length === 0) return [];

    const clients: Client[] = [];

    projects.forEach(({ client, ...rest }) => {
      client.projects = [];

      const project = { ...rest, client };

      const index = clients.findIndex(({ id }) => client.id === id);

      if (index >= 0)
        clients[index].projects = clients[index].projects.concat(project);
      else clients.push({ ...client, projects: [project] });
    });

    return clients;
  }

  async deleteUser(input: DeleteUserInput): Promise<boolean> {
    const user = await this.getUser(input);

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    const deleted = await this.userRepository.delete(user.id);

    return !!deleted;
  }
}
