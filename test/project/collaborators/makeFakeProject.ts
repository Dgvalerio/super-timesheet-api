import { Project } from '@/project/project.entity';
import {
  randCompanyName,
  randFutureDate,
  randNumber,
  randPastDate,
} from '@ngneat/falso';

import { makeFakeClient } from '!/client/collaborators/makeFakeClient';
import { randId, randMore } from '!/collaborators/randMore';

export const makeFakeProject = (): Project => ({
  id: randId(),
  name: randMore(randCompanyName()),
  code: randMore(String(randNumber())),
  startDate: randPastDate(),
  endDate: randFutureDate(),
  client: makeFakeClient(),
  categories: [],
});
