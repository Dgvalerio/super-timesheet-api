import { Field, HideField, ID, Int, ObjectType } from '@nestjs/graphql';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { hashPasswordTransform } from '@/common/helpers/cryptography';
import { GithubInfos } from '@/github-infos/github-infos.entity';
import { Project } from '@/project/project.entity';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ transformer: hashPasswordTransform })
  @HideField()
  password: string;

  @Column({ type: 'int', comment: 'Number of hours worked per day.' })
  @Field(() => Int)
  dailyHours: number;

  @ManyToMany(() => Project, (project) => project.users, { cascade: false })
  @JoinTable()
  projects: Project[];

  @OneToOne(() => AzureInfos, (azureInfos) => azureInfos.user)
  azureInfos?: AzureInfos;

  @OneToOne(() => GithubInfos, (githubInfos) => githubInfos.user)
  githubInfos?: GithubInfos;
}
