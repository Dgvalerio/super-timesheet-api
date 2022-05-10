import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserInput } from '@/user/dto/create-user.input';
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
    const conflicting = await this.userRepository.findBy({
      email: input.email,
    });

    if (conflicting.length > 0) {
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

  async getUser(params: GetUserInput): Promise<User> {
    let search = {};

    if (params.id) {
      search = { id: params.id };
    } else if (params.name) {
      search = { name: params.name };
    } else if (params.email) {
      search = { email: params.email };
    }

    return this.userRepository.findOneBy(search);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
}
