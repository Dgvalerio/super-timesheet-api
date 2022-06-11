import { makeCreateAzureInfosMutation } from '!/azure-infos/collaborators/makeCreateAzureInfosMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import { shouldThrowIfUnauthenticated } from '!/collaborators/helpers';

describe('[E2E] Azure Infos > Create', () => {
  const api = new ApolloClientHelper();

  beforeAll(async () => await api.authenticate());

  shouldThrowIfUnauthenticated('mutation', makeCreateAzureInfosMutation({}));
});
