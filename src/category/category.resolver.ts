import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { Category } from '@/category/category.entity';
import { CategoryService } from '@/category/category.service';
import { CreateCategoryInput } from '@/category/dto/create-category.input';
import { GetCategoryInput } from '@/category/dto/get-category.input';

@Resolver()
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Category)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.createCategory(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Category])
  async getAllCategories(): Promise<Category[]> {
    return this.categoryService.getAllCategories();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Category)
  async getCategory(@Args('input') input: GetCategoryInput): Promise<Category> {
    const category = await this.categoryService.getCategory(input);

    if (!category) {
      throw new NotFoundException('Nenhuma categoria foi encontrada');
    }

    return category;
  }
}
