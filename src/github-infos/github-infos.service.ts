import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateGithubInfosDto } from '@/github-infos/dto/create-github-infos.dto';
import { GithubInfos } from '@/github-infos/github-infos.entity';
import { UserService } from '@/user/user.service';

import { Octokit } from 'octokit';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class GithubInfosService {
  constructor(
    @InjectRepository(GithubInfos)
    private githubInfosRepository: Repository<GithubInfos>,
    private userService: UserService,
  ) {}

  async verifyAccessToken(
    token: GithubInfos['access_token'],
  ): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: token });

      await octokit.request('GET /user');

      return true;
    } catch (e) {
      return false;
    }
  }

  async createGithubInfos(input: CreateGithubInfosDto): Promise<GithubInfos> {
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
        'Houve um problema ao cadastrar suas informações',
      );
    }

    return this.getGithubInfos({ id: saved.id });
  }

  async getGithubInfos(
    params: FindOneOptions<GithubInfos>['where'],
  ): Promise<GithubInfos | null> {
    const options: FindOneOptions<GithubInfos> = { relations: { user: true } };

    if (params) options.where = { ...params };
    else throw new BadRequestException('Nenhum parâmetro válido foi informado');

    return this.githubInfosRepository.findOne(options);
  }
}
