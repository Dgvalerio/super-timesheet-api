import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

export enum SeedStatus {
  Wait = 'Waiting for load',
  Load = 'Loading',
  Save = 'Saving',
  Ok = 'Saved',
  Fail = 'Failed',
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
