import { AuthOutput } from '@/auth/dto/auth.output';
import { Client } from '@/client/client.entity';
import { CreateClientInput } from '@/client/dto/create-client.input';
import { GetClientInput } from '@/client/dto/get-client.input';
import { randWord } from '@ngneat/falso';

import { makeLoginMutation } from '!/auth/collaborators/makeLoginMutation';
import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { makeGetAllClientsQuery } from '!/client/collaborators/makeGetAllClientsQuery';
import { makeGetClientQuery } from '!/client/collaborators/makeGetClientQuery';
import {
  apolloAuthorizedClient,
  apolloClient,
} from '!/collaborators/apolloClient';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';

describe('Graphql User Module (e2e)', () => {
  let api: ApolloClient<NormalizedCacheObject>;

  beforeAll(async () => {
    const createUserInput = makeCreateUserInput();

    await apolloClient.mutate({
      mutation: makeCreateUserMutation(createUserInput),
    });

    const {
      data: {
        login: { token },
      },
    } = await apolloClient.mutate<{ login: AuthOutput }>({
      mutation: makeLoginMutation({
        email: createUserInput.email,
        password: createUserInput.password,
      }),
    });

    api = apolloAuthorizedClient(token);
  });

  describe('createClient', () => {
    const makeOut = async (input: Partial<CreateClientInput>) =>
      api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(input),
      });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

    it('should throw if enter a empty name', async () => {
      const createUserInput = makeCreateClientInput();

      createUserInput.name = '';

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('name should not be empty');
      expect(response.error).toBe('Bad Request');
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
      api.query<{ getAllClients: Client[] }>({
        query: makeGetAllClientsQuery(),
      });

    beforeAll(async () => {
      const createClientInput = makeCreateClientInput();

      const createdClient = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(createClientInput),
      });

      client = { ...createClientInput, ...createdClient.data.createClient };
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getAllClients: Client[] }>({
        query: makeGetAllClientsQuery(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

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
      });
    });
  });

  describe('getClient', () => {
    let client: Client;

    const makeOut = async (input: Partial<GetClientInput>) =>
      api.query<{ getClient: Client }>({
        query: makeGetClientQuery(input),
      });

    beforeAll(async () => {
      const createClientInput = makeCreateClientInput();

      const createdClient = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(createClientInput),
      });

      client = { ...createClientInput, ...createdClient.data.createClient };
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getClient: Client }>({
        query: makeGetClientQuery({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

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
