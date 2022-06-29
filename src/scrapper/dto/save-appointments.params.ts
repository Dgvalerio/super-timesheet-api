import { Appointment } from '@/appointment/appointment.entity';
import { AzureInfos } from '@/azure-infos/azure-infos.entity';

export interface SaveAppointmentsParams {
  azureInfos: AzureInfos;
  appointments: Appointment[];
}
