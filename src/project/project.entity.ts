import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Client } from '@/client/client.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true, nullable: true })
  code: string;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Client, (client) => client.projects)
  client: Client;
}
