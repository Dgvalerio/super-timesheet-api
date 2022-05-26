import { Client } from '@/client/client.entity';
import { CreateClientInput } from '@/client/dto/create-client.input';
import { GetClientInput } from '@/client/dto/get-client.input';
import { randWord } from '@ngneat/falso';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { makeGetAllClientsQuery } from '!/client/collaborators/makeGetAllClientsQuery';
import { makeGetClientQuery } from '!/client/collaborators/makeGetClientQuery';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';

describe('Graphql Client Module (e2e)', () => {
  const api = new ApolloClientHelper();

  beforeAll(async () => {
    await api.authenticate();
  });

  describe('createClient', () => {
    const makeOut = async (input: Partial<CreateClientInput>) =>
      api.mutation<{ createClient: Client }>(makeCreateClientMutation(input));

    shouldThrowIfUnauthenticated('mutation', makeCreateClientMutation({}));

    it('should throw if enter a empty name', async () => {
      const out = makeOut({ ...makeCreateClientInput(), name: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('name', graphQLErrors);
    });

    it('should create an client (without code)', async () => {
      const createClientInput = makeCreateClientInput();

      delete createClientInput.code;

      const { data } = await makeOut(createClientInput);

      expect(data).toHaveProperty('createClient');

      expect(data.createClient).toEqual({
        __typename: 'Client',
        id: expect.anything(),
        name: createClientInput.name,
        projects: [],
      });
    });

    it('should create an client (with code)', async () => {
      const createClientInput = makeCreateClientInput();

      const { data } = await makeOut(createClientInput);

      expect(data).toHaveProperty('createClient');

      expect(data.createClient).toEqual({
        __typename: 'Client',
        id: expect.anything(),
        name: createClientInput.name,
        code: createClientInput.code,
        projects: [],
      });
    });

    it('should fail if entered name already been registered', async () => {
      const { data } = await makeOut(makeCreateClientInput());

      const createClientInput = makeCreateClientInput();

      createClientInput.name = data.createClient.name;

      const out = makeOut(createClientInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse nome já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });

    it('should fail if entered code already been registered', async () => {
      const a = makeCreateClientInput();

      const { data } = await makeOut(a);

      const createClientInput = makeCreateClientInput();

      createClientInput.code = data.createClient.code;

      const out = makeOut(createClientInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse código já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });
  });

  describe('getAllClients', () => {
    let client: Client;

    const makeOut = async () =>
      api.query<{ getAllClients: Client[] }>(makeGetAllClientsQuery());

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

  describe('getClient', () => {
    let client: Client;

    const makeOut = async (input: Partial<GetClientInput>) =>
      api.query<{ getClient: Client }>(makeGetClientQuery(input));

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

      expect(graphQLErrors[0].message).toBe(
        'Nenhum parâmetro válido foi informado',
      );
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.error).toBe('Bad Request');
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

      expect(graphQLErrors[0].message).toBe('Nenhum cliente foi encontrado');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });
});
