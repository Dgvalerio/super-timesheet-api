import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CategoryService } from '@/category/category.service';
import { ClientService } from '@/client/client.service';
import {
  CreateProjectInput,
  DeleteProjectInput,
  GetProjectInput,
  UpdateProjectInput,
} from '@/project/dto';
import { AddCategoryInput } from '@/project/dto/add-category.input';
import { AddProjectToUserInput } from '@/project/dto/add-project-to-user.input';
import { Project } from '@/project/project.entity';
import { UserService } from '@/user/user.service';

import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private clientService: ClientService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  private async verifyConflicts<ValueType = string>(
    fieldName: keyof Project,
    newValue: ValueType
  ): Promise<void> {
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
      input.clientId ? { id: input.clientId } : { code: input.clientCode }
    );

    if (!client) {
      throw new NotFoundException('O cliente informado não existe!');
    }

    const created = await this.projectRepository.create({ ...input, client });
    const saved = await this.projectRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar um projeto'
      );
    }

    return this.getProject({ id: saved.id });
  }

  async getAllProjects(params: GetProjectInput): Promise<Project[]> {
    let search = {};

    if (params.id) {
      search = { id: params.id };
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

  async getProject(
    params: FindOneOptions<Project>['where']
  ): Promise<Project | null> {
    const options: FindOneOptions<Project> = {
      relations: {
        client: true,
        categories: true,
        users: true,
      },
    };

    if (params) options.where = { ...params };
    else throw new BadRequestException('Nenhum parâmetro válido foi informado');

    return this.projectRepository.findOne(options);
  }

  async updateProject(input: UpdateProjectInput): Promise<Project> {
    const newData: Partial<Project> = {};
    const project = await this.getProject({ id: input.id });

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    delete project.categories;

    if (input.code && input.code !== project.code) {
      await this.verifyConflicts('code', input.code);
      newData.code = input.code;
    }

    if (
      (input.clientId && input.clientId !== project.client.id) ||
      (input.clientCode && input.clientCode !== project.client.code)
    ) {
      const client = await this.clientService.getClient(
        input.clientId ? { id: input.clientId } : { code: input.clientCode }
      );

      if (!client) {
        throw new NotFoundException('O cliente informado não existe!');
      }

      newData.client = client;
    }

    if (input.name && input.name !== project.name) {
      newData.name = input.name;
    }

    if (input.startDate && input.startDate !== project.startDate) {
      newData.startDate = input.startDate;
    }

    if (input.endDate && input.endDate !== project.endDate) {
      newData.endDate = input.endDate;
    }

    if (Object.keys(newData).length === 0) {
      return project;
    }

    await this.projectRepository.update(project, { ...newData });

    const saved = await this.projectRepository.save({ ...project, ...newData });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao atualizar um projeto'
      );
    }

    return this.getProject({ id: input.id });
  }

  async deleteProject(input: DeleteProjectInput): Promise<boolean> {
    const project = await this.getProject(input);

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    const deleted = await this.projectRepository.delete(project.id);

    return !!deleted;
  }

  async addCategory(
    input: Pick<AddCategoryInput, 'projectId' | 'categoryId'>
  ): Promise<Project> {
    const project = await this.getProject({ id: input.projectId });

    const category = await this.categoryService.getCategory({
      id: input.categoryId,
    });

    if (project.categories.find(({ id }) => id === category.id)) {
      throw new ConflictException(
        `Essa categoria já foi adicionada a esse projeto!`
      );
    }

    const saved = await this.projectRepository.save({
      ...project,
      categories: [...project.categories, category],
    });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao adicionar uma categoria ao projeto'
      );
    }

    return this.getProject({ id: project.id });
  }

  async addProjectToUser(
    input: Pick<AddProjectToUserInput, 'userId' | 'projectId'>
  ): Promise<Project> {
    const user = await this.userService.getUser({
      id: input.userId,
    });

    const project = await this.getProject({
      id: input.projectId,
    });

    if (project.users.find(({ id }) => id === user.id)) {
      throw new ConflictException(
        `Esse projeto já foi adicionado a esse usuário!`
      );
    }

    const saved = await this.projectRepository.save({
      ...project,
      users: [...project.users, user],
    });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao adicionar o projeto ao usuário'
      );
    }

    return this.getProject({ id: user.id });
  }
}
