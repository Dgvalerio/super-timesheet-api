import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isValidParams from '@/common/helpers/is-valid-params';
import { GithubInfosService } from '@/github-infos/github-infos.service';
import { CreateRepositoryGroupDto } from '@/github/repository-group/dto/create-repository-group.dto';
import { RepositoryGroup } from '@/github/repository-group/repository-group.entity';

import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class RepositoryGroupService {
  constructor(
    @InjectRepository(RepositoryGroup)
    private repositoryGroupRepository: Repository<RepositoryGroup>,
    private githubInfosService: GithubInfosService
  ) {}

  async createRepositoryGroup(
    input: CreateRepositoryGroupDto
  ): Promise<RepositoryGroup> {
    const conflicting = await this.getRepositoryGroup({
      name: input.name,
      githubInfos: { id: input.githubInfosId },
    });

    if (conflicting) {
      throw new ConflictException('Um grupo com esse nome já foi criado!');
    }

    const githubInfos = await this.githubInfosService.getGithubInfos({
      id: input.githubInfosId,
    });

    const created = this.repositoryGroupRepository.create({
      name: input.name,
      repositories: input.repositories,
      githubInfos,
    });

    const saved = await this.repositoryGroupRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar suas informações'
      );
    }

    return this.getRepositoryGroup({ id: saved.id });
  }

  async getRepositoryGroup(
    params: FindOneOptions<RepositoryGroup>['where']
  ): Promise<RepositoryGroup | null> {
    const options: FindOneOptions<RepositoryGroup> = {
      relations: { githubInfos: true },
    };

    if (isValidParams(params)) options.where = { ...params };

    return this.repositoryGroupRepository.findOne(options);
  }
}
