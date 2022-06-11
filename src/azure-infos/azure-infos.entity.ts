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
export class AzureInfos {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  login: string;

  @Column()
  content: string;

  @Column()
  iv: string;

  @OneToOne(() => User, (user) => user.azureInfos)
  @JoinColumn()
  user: User;
}
