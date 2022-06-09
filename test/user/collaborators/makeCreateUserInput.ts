import { CreateUserInput } from '@/user/dto/create-user.input';
import {
  randEmail,
  randFullName,
  randNumber,
  randPassword,
} from '@ngneat/falso';

export const makeCreateUserInput = (): CreateUserInput => {
  const createUserInput = new CreateUserInput();

  createUserInput.name = randFullName();
  createUserInput.email = randEmail();

  const password = randPassword({ size: 8 });

  createUserInput.password = password;
  createUserInput.passwordConfirmation = password;

  createUserInput.dailyHours = randNumber({ min: 1, max: 24 });

  return createUserInput;
};
