import { Field, HideField, ID, Int, ObjectType } from '@nestjs/graphql';

import { hashPasswordTransform } from '@/common/helpers/cryptography';
import { Project } from '@/project/project.entity';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => Project, { cascade: false })
  @JoinTable()
  projects: Project[];
}
