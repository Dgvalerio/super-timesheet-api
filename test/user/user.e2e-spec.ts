import { CreateUserInput } from '@/user/dto/create-user.input';
import { User } from '@/user/user.entity';
import { randEmail, randFullName, randPassword } from '@ngneat/falso';

import { ApolloClient, gql, HttpLink, InMemoryCache } from 'apollo-boost';
import fetch from 'cross-fetch';

export const makeCreateUserInput = (): CreateUserInput => {
  const createUserInput = new CreateUserInput();

  createUserInput.name = randFullName();
  createUserInput.email = randEmail();
  createUserInput.password = randPassword({ size: 8 });

  return createUserInput;
};

export const makeCreateUserMutation = ({
  name,
  email,
  password,
}: Partial<CreateUserInput>) => gql`
  mutation {
    createUser(input: {
      name: "${name}"
      email: "${email}"
      password: "${password}"
    }) {
      id
      email
      name
    }
  }
`;

describe('Graphql User Module (e2e)', () => {
  let app: ApolloClient<any>;

  beforeAll(async () => {
    app = new ApolloClient({
      link: new HttpLink({ uri: 'http://localhost:3001/graphql', fetch }),
      cache: new InMemoryCache(),
    });
  });

  describe('createUser', () => {
    const makeOut = async (input: Partial<CreateUserInput>) =>
      app.mutate<{ createUser: User }>({
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
  });
});
