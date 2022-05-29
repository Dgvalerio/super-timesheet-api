import { User } from '@/user/user.entity';
import { randEmail, randFullName, randPassword } from '@ngneat/falso';

import { randId } from '!/collaborators/randMore';

export const makeFakeUser = (): User => ({
  id: randId(),
  name: randFullName(),
  email: randEmail(),
  password: randPassword({ size: 8 }),
  projects: [],
});
