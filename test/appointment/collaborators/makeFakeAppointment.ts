import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { getNow } from '@/common/helpers/today';
import { randBoolean, randRecentDate, randText, randUrl } from '@ngneat/falso';

import { makeFakeCategory } from '!/category/collaborators/makeFakeCategory';
import { randCode, randId } from '!/collaborators/randMore';
import { makeFakeProject } from '!/project/collaborators/makeFakeProject';
import { makeFakeUser } from '!/user/collaborators/makeFakeUser';

import { format, sub } from 'date-fns';

export const makeFakeAppointment = (): Appointment => {
  const now = getNow();

  return {
    id: randId(),
    code: randCode(),
    date: randRecentDate(),
    startTime: format(sub(now, { minutes: 3 }), 'HH:mm'),
    endTime: format(sub(now, { minutes: 2 }), 'HH:mm'),
    notMonetize: randBoolean(),
    description: randText({ charCount: 256 }),
    commit: randUrl(),
    status: AppointmentStatus.Draft,
    user: makeFakeUser(),
    project: makeFakeProject(),
    category: makeFakeCategory(),
  };
};
