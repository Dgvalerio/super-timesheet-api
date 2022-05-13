import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Project } from '@/project/project.entity';

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Project, (project) => project.client, {
    cascade: true,
  })
  projects: Project[];
}
