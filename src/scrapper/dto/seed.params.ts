import { AzureInfos } from '@/azure-infos/azure-infos.entity';

export interface SeedParams {
  login: AzureInfos['login'];
  password: string;
  user: AzureInfos['user'];
}
