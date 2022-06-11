import { User } from '@/user/user.entity';

import { ApolloClientHelper } from '!/collaborators/apolloClient';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

export const makeCreateUser = async (api: ApolloClientHelper) => {
  const { data } = await api.mutation<{ createUser: User }>(
    makeCreateUserMutation(makeCreateUserInput()),
  );

  return data.createUser;
};
