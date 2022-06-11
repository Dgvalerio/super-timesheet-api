import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { DeleteAzureInfosInput } from '@/azure-infos/dto/delete-azure-infos.input';
import { randEmail } from '@ngneat/falso';

import { makeCreateAzureInfosInput } from '!/azure-infos/collaborators/makeCreateAzureInfosInput';
import { makeCreateAzureInfosMutation } from '!/azure-infos/collaborators/makeCreateAzureInfosMutation';
import { makeDeleteAzureInfosMutation } from '!/azure-infos/collaborators/makeDeleteAzureInfosMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { makeCreateUser } from '!/collaborators/mutations';

describe('[E2E] Azure Infos > Delete', () => {
  const api = new ApolloClientHelper();

  const makeOut = async (input: Partial<DeleteAzureInfosInput>) =>
    api.mutation<{ deleteAzureInfos: AzureInfos }>(
      makeDeleteAzureInfosMutation(input),
    );

  beforeAll(async () => await api.authenticate());

  let azureInfos: AzureInfos;

  beforeEach(async () => {
    const input = makeCreateAzureInfosInput();

    const user = await makeCreateUser(api);

    input.userId = user.id;
    input.userEmail = user.email;

    const { data } = await api.mutation<{
      createAzureInfos: AzureInfos;
    }>(makeCreateAzureInfosMutation(input));

    azureInfos = data.createAzureInfos;
  });

  shouldThrowIfUnauthenticated('mutation', makeDeleteAzureInfosMutation({}));

  it('should throw if no parameter as entered', async () => {
    const out = makeOut({});

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Bad Request',
      messages: ['Nenhum parâmetro válido foi informado'],
    });
  });

  it('should delete by id', async () => {
    const { data } = await makeOut({ id: azureInfos.id });

    expect(data).toHaveProperty('deleteAzureInfos');
    expect(data.deleteAzureInfos).toBeTruthy();
  });

  it('should delete by login', async () => {
    const { data } = await makeOut({ login: azureInfos.login });

    expect(data).toHaveProperty('deleteAzureInfos');
    expect(data.deleteAzureInfos).toBeTruthy();
  });

  it('should throw if not found azure infos', async () => {
    const out = makeOut({ login: randEmail() });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'As informações solicitadas não existem!',
    });
  });
});
