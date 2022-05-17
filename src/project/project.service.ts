import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ClientService } from '@/client/client.service';
import {
  CreateProjectInput,
  DeleteProjectInput,
  GetProjectInput,
  UpdateProjectInput,
} from '@/project/dto';
import { Project } from '@/project/project.entity';

import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private clientService: ClientService,
  ) {}

  private async verifyConflicts<ValueType = string>(
    fieldName: keyof Project,
    newValue: ValueType,
  ) {
    const haveConflict = await this.getProject({ [fieldName]: newValue });

    if (haveConflict) {
      switch (fieldName) {
        case 'code':
          throw new ConflictException(`Esse código já foi utilizado!`);
        default:
          throw new ConflictException(`O "${fieldName}" já foi utilizado!`);
      }
    }
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    if (input.code) {
      await this.verifyConflicts('code', input.code);
    }

    const client = await this.clientService.getClient(
      input.clientId ? { id: input.clientId } : { code: input.clientCode },
    );

    if (!client) {
      throw new NotFoundException('O cliente informado não existe!');
    }

    const created = await this.projectRepository.create({ ...input, client });
    const saved = await this.projectRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar um projeto',
      );
    }

    return saved;
  }

  async getAllProjects(params: GetProjectInput): Promise<Project[]> {
    let search = {};

    if (params.id) {
      search = { id: params.id };
    } else if (params.name) {
      search = { name: params.name };
    } else if (params.code) {
      search = { code: params.code };
    } else {
      return this.projectRepository.find({ relations: { client: true } });
    }

    return this.projectRepository.find({
      where: search,
      relations: { client: true },
    });
  }

  async getProject(params: GetProjectInput): Promise<Project | null> {
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

    return this.projectRepository.findOne({
      where: search,
      relations: { client: true },
    });
  }

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    const newData: Partial<Project> = {};
    const project = await this.getProject(input);

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    if (input.code && input.code !== project.code) {
      await this.verifyConflicts('code', input.code);
      newData.code = input.code;
    }

    if (
      (input.clientId && input.clientId !== project.client.id) ||
      (input.clientCode && input.clientCode !== project.client.code)
    ) {
      const client = await this.clientService.getClient(
        input.clientId ? { id: input.clientId } : { code: input.clientCode },
      );

      if (!client) {
        throw new NotFoundException('O cliente informado não existe!');
      }

      newData.client = client;
    }

    if (input.name && input.name !== project.name) {
      newData.name = input.name;
    }

    if (input.startDate !== project.startDate) {
      newData.startDate = input.startDate;
    }

    if (input.endDate !== project.endDate) {
      newData.endDate = input.endDate;
    }

    if (Object.keys(newData).length === 0) {
      return this.getProject({ id: input.id });
    }

    await this.projectRepository.update(project, { ...newData });

    const saved = await this.projectRepository.save({ ...project, ...newData });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao atualizar um projeto',
      );
    }

    return saved;
  }

  async deleteProject(input: DeleteProjectInput): Promise<boolean> {
    const project = await this.getProject(input);

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    const deleted = await this.projectRepository.delete(project.id);

    return !!deleted;
  }
}
