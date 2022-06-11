import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { UpdateAzureInfosInput } from '@/azure-infos/dto/update-azure-infos.input';
import { randEmail } from '@ngneat/falso';

import { makeUpdateAzureInfosMutation } from '!/azure-infos/collaborators/makeUpdateAzureInfosMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { makeCreateAzureInfos } from '!/collaborators/mutations';
import { randId } from '!/collaborators/randMore';

describe('[E2E] Azure Infos > Update', () => {
  const api = new ApolloClientHelper();
  let azureInfos: AzureInfos;

  const makeOut = async (input: Partial<UpdateAzureInfosInput>) =>
    api.mutation<{ updateAzureInfos: AzureInfos }>(
      makeUpdateAzureInfosMutation(input),
    );

  beforeAll(async () => await api.authenticate());

  beforeEach(async () => {
    azureInfos = await makeCreateAzureInfos(api);
  });

  shouldThrowIfUnauthenticated('mutation', makeUpdateAzureInfosMutation({}));

  it('should throw if enter a empty id', async () => {
    const out = makeOut({ id: '' });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowIfEnterAEmptyParam('id', graphQLErrors);
  });

  it('should throw if not found azure infos', async () => {
    const out = makeOut({ id: randId() });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'As informações solicitadas não existem!',
    });
  });

  it('should throw if enter a empty login', async () => {
    const out = makeOut({ id: azureInfos.id, login: '' });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowIfEnterAEmptyParam('login', graphQLErrors);
  });

  it('should fail if login already been registered', async () => {
    const { login } = await makeCreateAzureInfos(api);

    const out = makeOut({ id: azureInfos.id, login });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Conflict',
      messages: 'Esse login já foi utilizado!',
    });
  });

  it('should throw if enter a empty password', async () => {
    const out = makeOut({ id: azureInfos.id, password: '' });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowIfEnterAEmptyParam('password', graphQLErrors);
  });

  it('should update azure infos', async () => {
    const login = randEmail();

    const { data } = await makeOut({ id: azureInfos.id, login });

    expect(data).toHaveProperty('updateAzureInfos');
    expect(data.updateAzureInfos).toEqual({
      __typename: 'AzureInfos',
      id: expect.anything(),
      iv: azureInfos.iv,
      content: azureInfos.content,
      login,
      user: {
        __typename: 'User',
        id: azureInfos.user.id,
      },
    });
  });
});
