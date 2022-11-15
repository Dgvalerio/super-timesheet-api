import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Category } from '@/category/category.entity';
import { CreateCategoryInput } from '@/category/dto/create-category.input';
import { DeleteCategoryInput } from '@/category/dto/delete-category.input';
import { GetCategoryInput } from '@/category/dto/get-category.input';
import isValidParams from '@/common/helpers/is-valid-params';

import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const conflicting = await this.getCategory({ name: input.name });

    if (conflicting) {
      throw new ConflictException('Esse nome já foi utilizado!');
    }

    if (input.code) {
      const haveCodeConflict = await this.getCategory({ code: input.code });

      if (haveCodeConflict) {
        throw new ConflictException('Esse código já foi utilizado!');
      }
    }

    const created = await this.categoryRepository.create(input);
    const saved = await this.categoryRepository.save(created);

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar uma categoria'
      );
    }

    return this.getCategory({ id: saved.id });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async getCategory(params: GetCategoryInput): Promise<Category> {
    const options: FindOneOptions<Category> = {};

    if (isValidParams(params)) options.where = { ...params };

    return this.categoryRepository.findOne(options);
  }

  async deleteCategory(input: DeleteCategoryInput): Promise<boolean> {
    const category = await this.getCategory(input);

    if (!category) {
      throw new NotFoundException('A categoria informada não existe!');
    }

    const deleted = await this.categoryRepository.delete(category.id);

    return !!deleted;
  }
}
