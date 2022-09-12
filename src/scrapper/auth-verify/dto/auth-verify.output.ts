import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

export enum AuthVerifyStatus {
  Wait = 'Wait',
  Load = 'Load',
  Process = 'Process',
  Ok = 'Ok',
  Fail = 'Fail',
}

registerEnumType(AuthVerifyStatus, {
  name: 'AuthVerifyStatus',
  description: 'Current status of auth verify operation.',
});

@ObjectType()
export class AuthVerifyOutput {
  userId: User[`id`];

  page: AuthVerifyStatus;

  auth: AuthVerifyStatus;

  cookies: AuthVerifyStatus;

  wipe: AuthVerifyStatus;
}

export const WATCH_AUTH_VERIFY = 'watchAuthVerify';
