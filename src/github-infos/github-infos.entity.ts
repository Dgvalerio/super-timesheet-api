import { Field, ID, ObjectType } from '@nestjs/graphql';

import { User } from '@/user/user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class GithubInfos {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column()
  access_token: string;

  @OneToOne(() => User, (user) => user.githubInfos)
  @JoinColumn()
  user: User;
}
