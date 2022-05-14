import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

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
    const conflicting = await this.getUser({ email: input.email });

    if (conflicting) {
      throw new ConflictException('Esse email já foi utilizado!');
    }

    const created = await this.userRepository.create(input);
    const saved = await this.userRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar um usuário',
      );
    }

    return saved;
  }

  async getUser(params: GetUserInput): Promise<User | null> {
    let search = {};

    if (params.id) {
      search = { id: params.id };
    } else if (params.name) {
      search = { name: params.name };
    } else if (params.email) {
      search = { email: params.email };
    } else {
      throw new BadRequestException('Nenhum parâmetro válido foi informado');
    }

    return this.userRepository.findOneBy(search);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
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
