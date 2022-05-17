import { CreateProjectInput } from '@/project/dto';
import {
  randCompanyName,
  randFutureDate,
  randNumber,
  randPastDate,
} from '@ngneat/falso';

import { randMore } from '!/collaborators/randMore';

export const makeCreateProjectInput = (): CreateProjectInput => {
  const createUserInput = new CreateProjectInput();

  createUserInput.name = randMore(randCompanyName());
  createUserInput.code = randMore(String(randNumber()));
  createUserInput.startDate = randPastDate();
  createUserInput.endDate = randFutureDate();
  createUserInput.clientId = randMore(String(randNumber()));
  createUserInput.clientCode = randMore(String(randNumber()));

  return createUserInput;
};
