import { Field, ID, ObjectType } from '@nestjs/graphql';

import { GithubInfos } from '@/github-infos/github-infos.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class RepositoryGroup {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  name: string;

  @Column('simple-array')
  repositories: string[];

  @ManyToOne(() => GithubInfos, (infos) => infos.repositoryGroups)
  githubInfos: GithubInfos;
}
