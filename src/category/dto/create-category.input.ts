import { InputType } from '@nestjs/graphql';

import { Category } from '@/category/category.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCategoryInput implements Partial<Category> {
  @IsString()
  @IsOptional()
  code?: Category['code'];

  @IsString()
  @IsNotEmpty()
  name: Category['name'];
}
