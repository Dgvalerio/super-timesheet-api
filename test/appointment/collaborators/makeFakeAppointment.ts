import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import {
  randBoolean,
  randRecentDate,
  randText,
  randPastDate,
  randFutureDate,
  randUrl,
} from '@ngneat/falso';

import { makeFakeCategory } from '!/category/collaborators/makeFakeCategory';
import { randCode, randId, randMore } from '!/collaborators/randMore';
import { makeFakeProject } from '!/project/collaborators/makeFakeProject';
import { makeFakeUser } from '!/user/collaborators/makeFakeUser';

export const makeFakeAppointment = (): Appointment => ({
  id: randId(),
  code: randCode(),
  date: randRecentDate(),
  startTime: randPastDate().toLocaleTimeString('pt-br', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  endTime: randFutureDate().toLocaleTimeString('pt-br', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  notMonetize: randBoolean(),
  description: randMore(randText()),
  commit: randUrl(),
  status: AppointmentStatus.Draft,
  user: makeFakeUser(),
  project: makeFakeProject(),
  category: makeFakeCategory(),
});
