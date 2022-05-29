import { CreateAppointmentInput } from '@/appointment/dto/create-appointment.input';

import { makeFakeAppointment } from '!/appointment/collaborators/makeFakeAppointment';

export const makeCreateAppointmentInput = (): CreateAppointmentInput => {
  const fakeAppointment = makeFakeAppointment();

  return {
    code: fakeAppointment.code,
    date: fakeAppointment.date,
    startTime: fakeAppointment.startTime,
    endTime: fakeAppointment.endTime,
    notMonetize: fakeAppointment.notMonetize,
    description: fakeAppointment.description,
    commit: fakeAppointment.commit,
    status: fakeAppointment.status,

    userId: fakeAppointment.user.id,
    userEmail: fakeAppointment.user.email,

    projectId: fakeAppointment.project.id,
    projectCode: fakeAppointment.project.code,

    categoryId: fakeAppointment.category.id,
    categoryCode: fakeAppointment.category.code,
    categoryName: fakeAppointment.category.name,
  };
};
