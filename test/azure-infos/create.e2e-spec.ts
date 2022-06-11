import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { CreateAzureInfosInput } from '@/azure-infos/dto/create-azure-infos.input';

import { makeCreateAzureInfosInput } from '!/azure-infos/collaborators/makeCreateAzureInfosInput';
import { makeCreateAzureInfosMutation } from '!/azure-infos/collaborators/makeCreateAzureInfosMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';

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
});
