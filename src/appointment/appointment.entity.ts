import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Category } from '@/category/category.entity';
import { Project } from '@/project/project.entity';
import { User } from '@/user/user.entity';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum AppointmentStatus {
  Approved = 'Approved',
  Review = 'Review',
  Unapproved = 'Unapproved',
  Draft = 'Draft',
}

registerEnumType(AppointmentStatus, {
  name: 'AppointmentStatus',
  description: 'Current status of appointment.',
});

@ObjectType()
@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: string;

  @Column({ unique: true, nullable: true })
  code?: string;

  @Column({ nullable: true })
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  notMonetize: boolean;

  @Column()
  description: string;

  @Column({ nullable: true })
  commit?: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.Draft,
  })
  status: AppointmentStatus;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Project)
  project: Project;

  @ManyToOne(() => Category)
  category: Category;
}
