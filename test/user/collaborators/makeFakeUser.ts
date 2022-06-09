import { User } from '@/user/user.entity';
import {
  randEmail,
  randFullName,
  randNumber,
  randPassword,
} from '@ngneat/falso';

import { randId } from '!/collaborators/randMore';

export const makeFakeUser = (): User => ({
  id: randId(),
  name: randFullName(),
  email: randEmail(),
  password: randPassword({ size: 8 }),
  dailyHours: randNumber({ min: 1, max: 24 }),
  projects: [],
});
