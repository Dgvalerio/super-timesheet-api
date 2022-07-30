import { User } from '@/user/user.entity';

export interface UpdateUserDto {
  id: User['id'];
  name?: User['name'];
  email?: User['email'];
  dailyHours?: User['dailyHours'];
  password: User['password'];
  newPassword?: User['password'];
  newPasswordConfirmation?: User['password'];
}
