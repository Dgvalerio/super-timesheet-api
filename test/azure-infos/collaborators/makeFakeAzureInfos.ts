import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { randAlphaNumeric, randEmail, randRecentDate } from '@ngneat/falso';

import { randId } from '!/collaborators/randMore';
import { makeFakeUser } from '!/user/collaborators/makeFakeUser';

import { format } from 'date-fns';

export const makeFakeAzureInfos = (): AzureInfos => ({
  id: randId(),
  user: makeFakeUser(),
  login: randEmail(),
  content: String(randAlphaNumeric()),
  iv: String(randAlphaNumeric()),
  currentMonthWorkedTime: format(randRecentDate(), 'HH:mm'),
});
