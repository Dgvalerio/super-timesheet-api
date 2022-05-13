import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import {
  CreateProjectInput,
  GetProjectInput,
  UpdateProjectInput,
  DeleteProjectInput,
} from '@/project/dto';
import { Project } from '@/project/project.entity';
import { ProjectService } from '@/project/project.service';

@Resolver()
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Project)
  async createProject(
    @Args('input') input: CreateProjectInput,
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
    @Args('input') input: UpdateProjectInput,
  ): Promise<Project> {
    return this.projectService.updateProject(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteProject(
    @Args('input') input: DeleteProjectInput,
  ): Promise<boolean> {
    return this.projectService.deleteProject(input);
  }
}
