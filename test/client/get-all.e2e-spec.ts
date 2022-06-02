import { Client } from '@/client/client.entity';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { makeGetAllClientsQuery } from '!/client/collaborators/makeGetAllClientsQuery';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import { shouldThrowIfUnauthenticated } from '!/collaborators/helpers';

describe('[E2E] Cliente > Get All', () => {
  const api = new ApolloClientHelper();

  const makeOut = async () =>
    api.query<{ getAllClients: Client[] }>(makeGetAllClientsQuery());

  beforeAll(async () => await api.authenticate());

  let client: Client;

  beforeAll(async () => {
    const createClientInput = makeCreateClientInput();

    const createdClient = await api.mutation<{ createClient: Client }>(
      makeCreateClientMutation(createClientInput),
    );

    client = { ...createClientInput, ...createdClient.data.createClient };
  });

  shouldThrowIfUnauthenticated('query', makeGetAllClientsQuery());

  it('should get and list all clients', async () => {
    const { data } = await makeOut();

    expect(data).toHaveProperty('getAllClients');

    expect(Array.isArray(data.getAllClients)).toBeTruthy();
    expect(data.getAllClients.length >= 1).toBeTruthy();
    expect(data.getAllClients.find(({ id }) => client.id === id)).toEqual({
      __typename: 'Client',
      id: client.id,
      name: client.name,
      code: client.code,
      projects: [],
    });
  });
});
