import { GithubInfos } from '@/github-infos/github-infos.entity';
import { RepositoryGroup } from '@/github/repository-group/repository-group.entity';

export interface CreateRepositoryGroupDto {
  name: RepositoryGroup['name'];

  repositories: RepositoryGroup['repositories'];

  // Relations
  // GithubInfos
  githubInfosId: GithubInfos['id'];
}
