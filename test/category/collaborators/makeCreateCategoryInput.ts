import { CreateCategoryInput } from '@/category/dto/create-category.input';
import { randCompanyName, randNumber } from '@ngneat/falso';

import { randMore } from '!/collaborators/randMore';

export const makeCreateCategoryInput = (): CreateCategoryInput => {
  const createCategoryInput = new CreateCategoryInput();

  createCategoryInput.name = randMore(randCompanyName());
  createCategoryInput.code = randMore(String(randNumber()));

  return createCategoryInput;
};
