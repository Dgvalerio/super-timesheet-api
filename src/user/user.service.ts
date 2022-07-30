import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Client } from '@/client/client.entity';
import { CreateUserInput } from '@/user/dto/create-user.input';
import { DeleteUserInput } from '@/user/dto/delete-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { User } from '@/user/user.entity';

import { compareSync } from 'bcrypt';
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

  async updateUser(input: UpdateUserDto): Promise<User> {
    const newData: Partial<User> = {};
    const user = await this.getUser({ id: input.id });

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    if (input.name && input.name !== user.name) {
      newData.name = input.name;
    }

    if (input.email && input.email !== user.email) {
      const conflicting = await this.getUser({ email: input.email });

      if (conflicting) {
        throw new ConflictException('Esse email já foi utilizado!');
      }

      newData.email = input.email;
    }

    if (input.dailyHours && input.dailyHours !== user.dailyHours) {
      newData.dailyHours = input.dailyHours;
    }

    if (input.newPassword) {
      if (input.newPassword !== input.newPasswordConfirmation) {
        throw new BadRequestException(
          'A confirmação da nova senha deve ser igual à nova senha!',
        );
      } else {
        newData.password = input.newPassword;
      }
    }

    if (Object.keys(newData).length === 0) {
      return user;
    } else {
      const validPassword = compareSync(input.password, user.password);

      if (!validPassword) {
        throw new UnauthorizedException('Senha incorreta!');
      }
    }

    await this.userRepository.update({ id: user.id }, { ...newData });

    const saved = await this.userRepository.save({ id: user.id, ...newData });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao atualizar o usuário',
      );
    }

    return this.getUser({ id: input.id });
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
