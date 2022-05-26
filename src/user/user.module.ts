import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '@/project/project.entity';
import { ProjectModule } from '@/project/project.module';
import { User } from '@/user/user.entity';
import { UserResolver } from '@/user/user.resolver';
import { UserService } from '@/user/user.service';

@Module({
  imports: [ProjectModule, TypeOrmModule.forFeature([User, Project])],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
