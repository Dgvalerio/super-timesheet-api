import { User } from '@/user/user.entity';
import { randEmail, randFullName, randPassword, randUuid } from '@ngneat/falso';

export const makeFakeUser = (): User => {
  const user = new User();

  user.id = randUuid();
  user.name = randFullName();
  user.email = randEmail();
  user.password = randPassword({ size: 8 });

  return user;
};
