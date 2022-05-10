import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

@ObjectType()
export class AuthOutput {
  @Field(() => User)
  user: User;

  token: string;
}
