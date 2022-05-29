import { Client } from '@/client/client.entity';
import { randCompanyName } from '@ngneat/falso';

import { randCode, randId } from '!/collaborators/randMore';

export const makeFakeClient = (): Client => ({
  id: randId(),
  name: randCompanyName(),
  code: randCode(),
  projects: [],
});
