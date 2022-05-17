import { UpdateProjectInput } from '@/project/dto';
import {
  randCompanyName,
  randFutureDate,
  randNumber,
  randPastDate,
  randUuid,
} from '@ngneat/falso';

import { randMore } from '!/collaborators/randMore';

export const makeUpdateProjectInput = (): UpdateProjectInput => {
  const updateProjectInput = new UpdateProjectInput();

  updateProjectInput.id = randMore(randUuid());
  updateProjectInput.name = randMore(randCompanyName());
  updateProjectInput.code = randMore(String(randNumber()));
  updateProjectInput.startDate = randPastDate();
  updateProjectInput.endDate = randFutureDate();
  updateProjectInput.clientId = randMore(String(randNumber()));
  updateProjectInput.clientCode = randMore(String(randNumber()));

  return updateProjectInput;
};
