import { InputType } from '@nestjs/graphql';

import { Project } from '@/project/project.entity';
import { User } from '@/user/user.entity';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddProjectToUserInput {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userId?: User['id'];

  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  userEmail?: User['email'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  projectId?: Project['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  projectCode?: Project['code'];
}
