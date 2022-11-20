import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isValidParams from '@/common/helpers/is-valid-params';
import { CreateGithubInfosDto } from '@/github-infos/dto/create-github-infos.dto';
import { GithubInfos } from '@/github-infos/github-infos.entity';
import { UserService } from '@/user/user.service';

import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class RepositoryGroupService {
  constructor(
    @InjectRepository(GithubInfos)
    private githubInfosRepository: Repository<GithubInfos>,
    private userService: UserService
  ) {}

  async createRepositoryGroup(
    input: CreateGithubInfosDto
  ): Promise<GithubInfos> {
    const user = await this.userService.getUser({ id: input.userId });

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    const conflicting = await this.getGithubInfos({
      user: { id: input.userId },
    });

    if (conflicting) {
      throw new ConflictException('Esse usuário já tem um token!');
    }

    const validAuth = await this.verifyAccessToken(input.access_token);

    if (!validAuth) {
      throw new BadRequestException('Token de acesso inválido!');
    }

    const created = this.githubInfosRepository.create({
      access_token: input.access_token,
      user,
    });
    const saved = await this.githubInfosRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar suas informações'
      );
    }

    return this.getGithubInfos({ id: saved.id });
  }

  async getGithubInfos(
    params: FindOneOptions<GithubInfos>['where']
  ): Promise<GithubInfos | null> {
    const options: FindOneOptions<GithubInfos> = { relations: { user: true } };

    if (isValidParams(params)) options.where = { ...params };

    return this.githubInfosRepository.findOne(options);
  }
}
