import { Appointment } from '@/appointment/appointment.entity';
import { Category } from '@/category/category.entity';
import { Project } from '@/project/project.entity';
import { User } from '@/user/user.entity';

export interface CreateAppointmentDto {
  code?: Appointment['code'];
  date: Appointment['date'];
  startTime: Appointment['startTime'];
  endTime: Appointment['endTime'];
  notMonetize: Appointment['notMonetize'];
  description: Appointment['description'];
  commit?: Appointment['commit'];
  status: Appointment['status'];

  // Relations
  // User
  userId: User['id'];

  // Project
  projectId?: Project['id'];
  projectCode?: Project['code'];

  // Category
  categoryId?: Category['id'];
  categoryName?: Category['name'];
  categoryCode?: Category['code'];
}
