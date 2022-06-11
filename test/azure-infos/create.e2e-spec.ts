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
import { randId } from '!/collaborators/randMore';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

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
    const {
      data: { createUser },
    } = await api.mutation<{ createUser: User }>(
      makeCreateUserMutation(makeCreateUserInput()),
    );

    const input = makeCreateAzureInfosInput();

    input.userId = randId() + createUser.id;

    const out = makeOut(input);

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'O usuário informado não existe!',
    });
  });
});
