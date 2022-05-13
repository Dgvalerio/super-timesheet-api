import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Client } from '@/client/client.entity';
import { ClientService } from '@/client/client.service';
import { Project } from '@/project/project.entity';
import { ProjectResolver } from '@/project/project.resolver';
import { ProjectService } from '@/project/project.service';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Project, User])],
  providers: [ProjectService, ProjectResolver, ClientService, UserService],
})
export class ProjectModule {}
