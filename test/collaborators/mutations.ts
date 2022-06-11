import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { User } from '@/user/user.entity';

import { makeCreateAzureInfosInput } from '!/azure-infos/collaborators/makeCreateAzureInfosInput';
import { makeCreateAzureInfosMutation } from '!/azure-infos/collaborators/makeCreateAzureInfosMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

export const makeCreateUser = async (
  api: ApolloClientHelper,
): Promise<User> => {
  const { data } = await api.mutation<{ createUser: User }>(
    makeCreateUserMutation(makeCreateUserInput()),
  );

  return data.createUser;
};

export const makeCreateAzureInfos = async (
  api: ApolloClientHelper,
): Promise<AzureInfos> => {
  const createUser = await makeCreateUser(api);

  const input = makeCreateAzureInfosInput();

  input.userId = createUser.id;

  const { data } = await api.mutation<{ createAzureInfos: AzureInfos }>(
    makeCreateAzureInfosMutation(input),
  );

  return data.createAzureInfos;
};
