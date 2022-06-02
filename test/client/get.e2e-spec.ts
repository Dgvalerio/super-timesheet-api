import { Client } from '@/client/client.entity';
import { GetClientInput } from '@/client/dto/get-client.input';
import { randWord } from '@ngneat/falso';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { makeGetClientQuery } from '!/client/collaborators/makeGetClientQuery';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';

describe('[E2E] Cliente > Get', () => {
  const api = new ApolloClientHelper();

  const makeOut = async (input: Partial<GetClientInput>) =>
    api.query<{ getClient: Client }>(makeGetClientQuery(input));

  beforeAll(async () => await api.authenticate());

  let client: Client;

  beforeAll(async () => {
    const createClientInput = makeCreateClientInput();

    const createdClient = await api.mutation<{ createClient: Client }>(
      makeCreateClientMutation(createClientInput),
    );

    client = { ...createClientInput, ...createdClient.data.createClient };
  });

  shouldThrowIfUnauthenticated('query', makeGetClientQuery({}));

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
    const { data } = await makeOut({ id: client.id });

    expect(data).toHaveProperty('getClient');
    expect(data.getClient).toEqual({
      __typename: 'Client',
      id: client.id,
      name: client.name,
      code: client.code,
      projects: client.projects,
    });
  });

  it('should get and show by name', async () => {
    const { data } = await makeOut({ name: client.name });

    expect(data).toHaveProperty('getClient');
    expect(data.getClient).toEqual({
      __typename: 'Client',
      id: client.id,
      name: client.name,
      code: client.code,
      projects: client.projects,
    });
  });

  it('should get and show by code', async () => {
    const { data } = await makeOut({ code: client.code });

    expect(data).toHaveProperty('getClient');
    expect(data.getClient).toEqual({
      __typename: 'Client',
      id: client.id,
      name: client.name,
      code: client.code,
      projects: client.projects,
    });
  });

  it('should throw if not found client', async () => {
    const out = makeOut({ name: `${randWord()}_${client.id}` });

    const { graphQLErrors } = await out.catch((e) => e);

    shouldThrowHelper({
      graphQLErrors,
      predictedError: 'Not Found',
      messages: 'Nenhum cliente foi encontrado',
    });
  });
});
