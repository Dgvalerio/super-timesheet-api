import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { CreateAzureInfosInput } from '@/azure-infos/dto/create-azure-infos.input';
import { User } from '@/user/user.entity';

import { makeCreateAzureInfosInput } from '!/azure-infos/collaborators/makeCreateAzureInfosInput';
import { makeCreateAzureInfosMutation } from '!/azure-infos/collaborators/makeCreateAzureInfosMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

const makeCreateUser = async (api: ApolloClientHelper) => {
  const { data } = await api.mutation<{ createUser: User }>(
    makeCreateUserMutation(makeCreateUserInput()),
  );

  return data.createUser;
};

describe('[E2E] Azure Infos > Create', () => {
  const api = new ApolloClientHelper();

  const makeOut = async (input: Partial<CreateAzureInfosInput>) =>
    api.mutation<{ createAzureInfos: AzureInfos }>(
      makeCreateAzureInfosMutation(input),
    );

  beforeAll(async () => await api.authenticate());

  shouldThrowIfUnauthenticated('mutation', makeCreateAzureInfosMutation({}));

  it('should throw if enter a empty login', async () => {
    const input = makeCreateAzureInfosInput();

    input.login = '';

    const out = makeOut(input);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowIfEnterAEmptyParam('login', graphQLErrors);
  });

  it('should throw if enter a empty password', async () => {
    const input = makeCreateAzureInfosInput();

    input.password = '';

    const out = makeOut(input);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowIfEnterAEmptyParam('password', graphQLErrors);
  });

  it('should throw if enter a empty userId and userEmail', async () => {
    const input = makeCreateAzureInfosInput();

    input.userId = '';
    input.userEmail = '';

    const out = makeOut(input);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Bad Request',
      messages: [
        'userId should not be empty',
        'userId must be a string',
        'userEmail should not be empty',
        'userEmail must be a string',
      ],
    });
  });

  it('should throw if enter a invalid user', async () => {
    const out = makeOut(makeCreateAzureInfosInput());

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'O usuário informado não existe!',
    });
  });

  it('should save azure infos', async () => {
    const createUser = await makeCreateUser(api);

    const input = makeCreateAzureInfosInput();

    input.userId = createUser.id;

    const { data } = await makeOut(input);

    expect(data).toHaveProperty('createAzureInfos');
    expect(data.createAzureInfos).toEqual({
      __typename: 'AzureInfos',
      id: expect.anything(),
      iv: expect.anything(),
      content: expect.anything(),
      login: input.login,
      user: {
        __typename: 'User',
        id: createUser.id,
      },
    });
  });

  it('should fail if login already been registered', async () => {
    const createUser = await makeCreateUser(api);

    const input = makeCreateAzureInfosInput();

    input.userId = createUser.id;

    await makeOut(input);

    const out = makeOut(input);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Conflict',
      messages: 'Esse login já foi salvo!',
    });
  });
});
