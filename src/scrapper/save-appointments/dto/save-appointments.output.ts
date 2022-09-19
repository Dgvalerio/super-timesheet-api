import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';
import { User } from '@/user/user.entity';

@ObjectType()
export class AzureAppointment {
  id: string;

  client: string;

  project: string;

  category: string;

  description: string;

  date: string;

  commit?: string;

  notMonetize: boolean;

  startTime: string;

  endTime: string;
}

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

  client: SaveAppointmentsStatus;

  _client: Appointment[`project`][`client`][`name`];

  project: SaveAppointmentsStatus;

  _project: Appointment[`project`][`name`];

  category: SaveAppointmentsStatus;

  _category: Appointment[`category`][`name`];

  description: SaveAppointmentsStatus;

  _description: Appointment[`description`];

  date: SaveAppointmentsStatus;

  _date: Appointment[`date`];

  commit: SaveAppointmentsStatus;

  _commit: Appointment[`commit`];

  notMonetize: SaveAppointmentsStatus;

  _notMonetize: Appointment[`notMonetize`];

  startTime: SaveAppointmentsStatus;

  _startTime: Appointment[`startTime`];

  endTime: SaveAppointmentsStatus;

  _endTime: Appointment[`endTime`];

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

  saving: number;

  saved: number;

  updated: number;

  appointment: AppointmentProgress;
}

export const WATCH_SAVE_APPOINTMENTS = 'watchSaveAppointments';
