import { User } from '@/user/user.entity';

import { IncomingMessage } from 'http';

export interface ContextWithUser {
  req: IncomingMessage & { user: User };
}
