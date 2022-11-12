import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { CategoryService } from '@/category/category.service';
import {
  CreateProjectInput,
  GetProjectInput,
  UpdateProjectInput,
  DeleteProjectInput,
} from '@/project/dto';
import { AddCategoryInput } from '@/project/dto/add-category.input';
import { AddProjectToUserInput } from '@/project/dto/add-project-to-user.input';
import { Project } from '@/project/project.entity';
import { ProjectService } from '@/project/project.service';
import { UserService } from '@/user/user.service';

@Resolver()
export class ProjectResolver {
  constructor(
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Project)
  async createProject(
    @Args('input') input: CreateProjectInput
  ): Promise<Project> {
    return this.projectService.createProject(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Project])
  async getAllProjects(): Promise<Project[]> {
    return this.projectService.getAllProjects({});
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Project)
  async getProject(@Args('input') input: GetProjectInput): Promise<Project> {
    const project = await this.projectService.getProject(input);

    if (!project) {
      throw new NotFoundException('Nenhum projeto foi encontrado');
    }

    return project;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Project)
  async updateProject(
    @Args('input') input: UpdateProjectInput
  ): Promise<Project> {
    return this.projectService.updateProject(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteProject(
    @Args('input') input: DeleteProjectInput
  ): Promise<boolean> {
    return this.projectService.deleteProject(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Project)
  async addCategory(@Args('input') input: AddCategoryInput): Promise<Project> {
    const project = await this.projectService.getProject({
      id: input.projectId,
      code: input.projectCode,
    });

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    const category = await this.categoryService.getCategory({
      id: input.categoryId,
      code: input.categoryCode,
      name: input.categoryName,
    });

    if (!category) {
      throw new NotFoundException('A categoria informada não existe!');
    }

    return this.projectService.addCategory({
      projectId: project.id,
      categoryId: category.id,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Project)
  async addProjectToUser(
    @Args('input') input: AddProjectToUserInput
  ): Promise<Project> {
    const user = await this.userService.getUser({
      id: input.userId,
      email: input.userEmail,
    });

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    const project = await this.projectService.getProject({
      id: input.projectId,
      code: input.projectCode,
    });

    if (!project) {
      throw new NotFoundException('O projeto informado não existe!');
    }

    return this.projectService.addProjectToUser({
      userId: user.id,
      projectId: project.id,
    });
  }
}
