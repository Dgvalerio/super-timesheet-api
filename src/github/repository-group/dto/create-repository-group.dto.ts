import { GithubInfos } from '@/github-infos/github-infos.entity';
import { User } from '@/user/user.entity';

export interface CreateRepositoryGroupDto {
  access_token: GithubInfos['access_token'];

  // Relations
  // User
  userId: User['id'];
}
