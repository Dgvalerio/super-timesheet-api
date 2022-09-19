import { Appointment } from '@/appointment/appointment.entity';
import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { CookieType } from '@/scrapper/auth-verify/dto/cookie.output';
import {
  AppointmentProgress,
  AzureAppointment,
  SaveAppointmentsProgress,
} from '@/scrapper/save-appointments/dto/save-appointments.output';
import { Seed } from '@/scrapper/seed/dto/seed.types';
import { User } from '@/user/user.entity';

export namespace SaveAppointmentsUtilsTypes {
  export interface UserData {
    id: User['id'];
    email: AzureInfos['login'];
    password: string;
  }

  export interface SearchOutput
    extends Omit<Appointment, `user` | `date` | `project` | `category`> {
    date: string;
    client: string;
    category: string;
    project: string;
  }

  export type UpdateInput = Pick<
    Appointment,
    'id' | 'code' | 'status' | 'commit'
  >;

  export type AzureAppointmentWithStatus = AzureAppointment & {
    status: string;
  };

  export type GetDataFromRow = Pick<
    AzureAppointmentWithStatus,
    `date` | `startTime` | `endTime` | `status`
  > & { code: string };

  export interface Interface {
    progress: SaveAppointmentsProgress;
    setProgress(
      newProgress: Partial<
        Omit<SaveAppointmentsProgress, 'appointment'> & {
          appointment: Partial<AppointmentProgress>;
        }
      >,
    ): Promise<void>;
    requestFactory(cookies: Seed.AuthVerify['cookies']): void;
    loadPage(): Promise<void>;
    loadAppointments(): Promise<void>;
    signIn(): Promise<CookieType[]>;
    resetAppointmentProgress(): Promise<void>;
    adapteToAzure(appointment: Appointment): Promise<AzureAppointment>;
    createAppointment(appointment: AzureAppointment): Promise<boolean>;
    searchInAppointments(
      search: AzureAppointment,
    ): Promise<SearchOutput | undefined>;
    descriptionAdapter(description: string): string;
    compareAppointments(
      searchResult: SearchOutput,
      toSave: AzureAppointment,
    ): boolean;
    processAppointments(): Promise<void>;
    run(): Promise<void>;
  }
}
