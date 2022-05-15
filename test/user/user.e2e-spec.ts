import { AuthOutput } from '@/auth/dto/auth.output';
import { CreateUserInput } from '@/user/dto/create-user.input';
import { GetUserInput } from '@/user/dto/get-user.input';
import { User } from '@/user/user.entity';

import { makeLoginMutation } from '!/auth/collaborators/makeLoginMutation';
import {
  apolloAuthorizedClient,
  apolloClient,
} from '!/collaborators/apolloClient';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';
import { makeGetAllUsersQuery } from '!/user/collaborators/makeGetAllUsersQuery';
import { makeGetUserQuery } from '!/user/collaborators/makeGetUserQuery';

import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';

describe('Graphql User Module (e2e)', () => {
  describe('createUser', () => {
    const makeOut = async (input: Partial<CreateUserInput>) =>
      apolloClient.mutate<{ createUser: User }>({
        mutation: makeCreateUserMutation(input),
      });

    it('should throw if enter a empty name', async () => {
      const createUserInput = makeCreateUserInput();

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

    it('should throw if enter a empty and invalid email', async () => {
      const createUserInput = makeCreateUserInput();

      createUserInput.email = '';

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('email should not be empty');
      expect(response.message[1]).toBe('email must be an email');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a empty and invalid password', async () => {
      const createUserInput = makeCreateUserInput();

      createUserInput.password = '';

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('password should not be empty');
      expect(response.message[1]).toBe(
        'password must be longer than or equal to 8 characters',
      );
      expect(response.error).toBe('Bad Request');
    });

    it('should create an user', async () => {
      const createUserInput = makeCreateUserInput();

      const { data } = await makeOut(createUserInput);

      expect(data).toHaveProperty('createUser');

      expect(data.createUser).toEqual({
        __typename: 'User',
        id: expect.anything(),
        name: createUserInput.name,
        email: createUserInput.email,
      });
    });

    it('should fail if you enter an email that has already been registered', async () => {
      const {
        data: {
          createUser: { email },
        },
      } = await makeOut(makeCreateUserInput());

      const createUserInput = makeCreateUserInput();

      createUserInput.email = email;

      const out = makeOut(createUserInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse email já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });
  });

  describe('getAllUsers', () => {
    let user: User;
    let client: ApolloClient<NormalizedCacheObject>;

    const makeOut = async () =>
      client.query<{ getAllUsers: User[] }>({
        query: makeGetAllUsersQuery(),
      });

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      const {
        data: { createUser },
      } = await apolloClient.mutate<{ createUser: User }>({
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

      client = apolloAuthorizedClient(token);
      user = createUser;
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getAllUsers: User[] }>({
        query: makeGetAllUsersQuery(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

    it('should get and list all users', async () => {
      const { data } = await makeOut();

      expect(data).toHaveProperty('getAllUsers');

      expect(Array.isArray(data.getAllUsers)).toBeTruthy();
      expect(data.getAllUsers.length >= 1).toBeTruthy();
      expect(data.getAllUsers.find(({ id }) => user.id === id)).toEqual({
        __typename: 'User',
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });
  });

  describe('getUser', () => {
    let user: User;
    let client: ApolloClient<NormalizedCacheObject>;

    const makeOut = async (input: Partial<GetUserInput>) =>
      client.query<{ getUser: User }>({
        query: makeGetUserQuery(input),
      });

    beforeAll(async () => {
      const createUserInput = makeCreateUserInput();

      const {
        data: { createUser },
      } = await apolloClient.mutate<{ createUser: User }>({
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

      client = apolloAuthorizedClient(token);
      user = createUser;
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ createUser: User }>({
        query: makeGetUserQuery({}),
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
  });
});
