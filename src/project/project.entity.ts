import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Category } from '@/category/category.entity';
import { Client } from '@/client/client.entity';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true, nullable: true })
  code?: string;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Client, (client) => client.projects)
  client: Client;

  @ManyToMany(() => Category, { cascade: false })
  @JoinTable()
  categories: Category[];
}
