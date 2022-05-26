import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@/category/category.entity';
import { CategoryService } from '@/category/category.service';
import { Client } from '@/client/client.entity';
import { ClientService } from '@/client/client.service';
import { Project } from '@/project/project.entity';
import { ProjectResolver } from '@/project/project.resolver';
import { ProjectService } from '@/project/project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Client, Category])],
  providers: [ProjectService, ProjectResolver, ClientService, CategoryService],
  exports: [ProjectService],
})
export class ProjectModule {}
