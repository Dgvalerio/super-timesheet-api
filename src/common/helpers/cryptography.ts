import { hashSync } from 'bcrypt';

export const hashPasswordTransform = {
  to(password: string): string {
    return hashSync(password, 8);
  },
  from(hash: string): string {
    return hash;
  },
};
