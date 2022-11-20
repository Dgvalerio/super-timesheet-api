import { Field, ID, ObjectType } from '@nestjs/graphql';

import { RepositoryGroup } from '@/github/repository-group/repository-group.entity';
import { User } from '@/user/user.entity';

import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
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

  @OneToMany(() => RepositoryGroup, (group) => group.githubInfos, {
    cascade: true,
  })
  repositoryGroups: RepositoryGroup[];

  @OneToOne(() => User, (user) => user.githubInfos)
  @JoinColumn()
  user: User;
}
