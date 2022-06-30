import { ObjectType } from '@nestjs/graphql';

import { Appointment } from '@/appointment/appointment.entity';

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

@ObjectType()
export class SaveAppointmentOutput {
  appointment?: Appointment;

  saved: boolean;

  message: string;
}
