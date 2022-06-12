import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { GetAzureInfosInput } from '@/azure-infos/dto/get-azure-infos.input';
import { randEmail } from '@ngneat/falso';

import { makeCreateAzureInfosInput } from '!/azure-infos/collaborators/makeCreateAzureInfosInput';
import { makeCreateAzureInfosMutation } from '!/azure-infos/collaborators/makeCreateAzureInfosMutation';
import { makeGetAzureInfosQuery } from '!/azure-infos/collaborators/makeGetAzureInfosQuery';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { makeCreateUser } from '!/collaborators/mutations';
import { randMore } from '!/collaborators/randMore';

describe('[E2E] Azure Infos > Get', () => {
  const api = new ApolloClientHelper();

  const makeOut = async (input: Partial<GetAzureInfosInput>) =>
    api.query<{ getAzureInfos: AzureInfos }>(makeGetAzureInfosQuery(input));

  beforeAll(async () => await api.authenticate());

  let azureInfos: AzureInfos;

  beforeAll(async () => {
    const input = makeCreateAzureInfosInput();

    const user = await makeCreateUser(api);

    input.userId = user.id;
    input.userEmail = user.email;

    const { data } = await api.mutation<{
      createAzureInfos: AzureInfos;
    }>(makeCreateAzureInfosMutation(input));

    azureInfos = data.createAzureInfos;
  });

  shouldThrowIfUnauthenticated('query', makeGetAzureInfosQuery({}));

  it('should throw if no parameter as entered', async () => {
    const out = makeOut({});

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Bad Request',
      messages: ['Nenhum parâmetro válido foi informado'],
    });
  });

  it('should get and show by id', async () => {
    const { data } = await makeOut({ id: azureInfos.id });

    expect(data).toHaveProperty('getAzureInfos');
    expect(data.getAzureInfos).toEqual({
      __typename: 'AzureInfos',
      id: azureInfos.id,
      login: azureInfos.login,
      iv: azureInfos.iv,
      content: azureInfos.content,
      currentMonthWorkedTime: '00:00',
      user: { __typename: 'User', id: azureInfos.user.id },
    });
  });

  it('should get and show by login', async () => {
    const { data } = await makeOut({ login: azureInfos.login });

    expect(data).toHaveProperty('getAzureInfos');
    expect(data.getAzureInfos).toEqual({
      __typename: 'AzureInfos',
      id: azureInfos.id,
      login: azureInfos.login,
      iv: azureInfos.iv,
      content: azureInfos.content,
      currentMonthWorkedTime: '00:00',
      user: { __typename: 'User', id: azureInfos.user.id },
    });
  });

  it('should throw if not found azure infos', async () => {
    const out = makeOut({ login: randMore(randEmail()) });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'Nenhuma informação foi encontrada',
    });
  });
});
