import { Category } from '@/category/category.entity';
import { randProductCategory } from '@ngneat/falso';

import { randCode, randId } from '!/collaborators/randMore';

export const makeFakeCategory = (): Category => ({
  id: randId(),
  name: randProductCategory(),
  code: randCode(),
});
