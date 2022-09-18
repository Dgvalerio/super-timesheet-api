import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

export enum SeedStatus {
  Wait = 'Wait',
  Load = 'Load',
  Save = 'Save',
  Ok = 'Ok',
  Fail = 'Fail',
}

registerEnumType(SeedStatus, {
  name: 'SeedStatus',
  description: 'Current status of seed operation.',
});

@ObjectType()
export class SeedOutput {
  userId: User['id'];

  login: SeedStatus;

  clients: SeedStatus;

  projects: SeedStatus;

  categories: SeedStatus;

  appointments: SeedStatus;
}

export const WATCH_IMPORT_DATA = 'watchImportData';
