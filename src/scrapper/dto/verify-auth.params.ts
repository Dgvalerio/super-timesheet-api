import { AzureInfos } from '@/azure-infos/azure-infos.entity';

export interface VerifyAuthParams {
  login: AzureInfos['login'];
  password: string;
  user: AzureInfos['user'];
}
