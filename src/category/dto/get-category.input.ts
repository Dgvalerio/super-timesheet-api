import { InputType } from '@nestjs/graphql';

import { Category } from '@/category/category.entity';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GetCategoryInput implements Partial<Category> {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id?: Category['id'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: Category['name'];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: Category['code'];
}
