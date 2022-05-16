import { CreateClientInput } from '@/client/dto/create-client.input';
import { randCompanyName, randNumber } from '@ngneat/falso';

import { randMore } from '!/collaborators/randMore';

export const makeCreateClientInput = (): CreateClientInput => {
  const createUserInput = new CreateClientInput();

  createUserInput.name = randMore(randCompanyName());
  createUserInput.code = randMore(String(randNumber()));

  return createUserInput;
};
