import { InputType } from '@nestjs/graphql';

import { Category } from '@/category/category.entity';
import { Project } from '@/project/project.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class AddCategoryInput {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  projectId?: Project['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  projectCode?: Project['code'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryId?: Category['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryName?: Category['name'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  categoryCode?: Category['code'];
}
