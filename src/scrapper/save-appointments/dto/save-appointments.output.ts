import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';
import { User } from '@/user/user.entity';

export enum SaveAppointmentsStatus {
  Wait = 'Wait',
  Load = 'Load',
  Process = 'Process',
  Ok = 'Ok',
  Fail = 'Fail',
}

registerEnumType(SaveAppointmentsStatus, {
  name: 'SaveAppointmentsStatus',
  description: 'Current status of save appointments operation.',
});

@ObjectType()
export class AppointmentProgress {
  page: SaveAppointmentsStatus;

  adapteToAzure: SaveAppointmentsStatus;

  id: Appointment[`id`];

  client: SaveAppointmentsStatus;

  project: SaveAppointmentsStatus;

  category: SaveAppointmentsStatus;

  description: SaveAppointmentsStatus;

  date: SaveAppointmentsStatus;

  commit: SaveAppointmentsStatus;

  notMonetize: SaveAppointmentsStatus;

  startTime: SaveAppointmentsStatus;

  endTime: SaveAppointmentsStatus;

  failMessage?: string;

  saveInAzure: SaveAppointmentsStatus;

  search: SaveAppointmentsStatus;

  getMoreData: SaveAppointmentsStatus;

  update: SaveAppointmentsStatus;
}

@ObjectType()
export class SaveAppointmentsProgress {
  userId: User[`id`];

  page: SaveAppointmentsStatus;

  loadAppointments: SaveAppointmentsStatus;

  auth: SaveAppointmentsStatus;

  saving: SaveAppointmentsStatus;

  saved: number;

  updated: number;

  appointment: AppointmentProgress;
}

export const WATCH_SAVE_APPOINTMENTS = 'watchSaveAppointments';
