import { ApolloClient, gql, HttpLink, InMemoryCache } from 'apollo-boost';
import fetch from 'cross-fetch';

const makeLoginMutation = (
  email = 'dio@genes.com',
  password = '12345678',
) => gql`
  mutation {
    login(input: { email: "${email}", password: "${password}" }) {
      user {
        id
        email
        name
      }
      token
    }
  }
`;

describe('Graphql Auth Module (e2e)', () => {
  let app: ApolloClient<any>;

  beforeAll(async () => {
    app = new ApolloClient({
      link: new HttpLink({ uri: 'http://localhost:3001/graphql', fetch }),
      cache: new InMemoryCache(),
    });
  });

  describe('Login', () => {
    it('should throw if enter a invalid email', async () => {
      const promise = app.mutate({
        mutation: makeLoginMutation('invalid-email'),
      });

      const { graphQLErrors } = await promise.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions.response.message[0]).toBe(
        'email must be an email',
      );
    });

    it('should throw if enter a email of invalid user', async () => {
      const promise = app.mutate({
        mutation: makeLoginMutation('never@created.com'),
      });

      const { graphQLErrors } = await promise.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhum usuário foi encontrado');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(404);
      expect(graphQLErrors[0].extensions.response.error).toBe('Not Found');
    });

    it('should throw if enter a invalid password', async () => {
      const promise = app.mutate({
        mutation: makeLoginMutation('dio@genes.com', '12344321'),
      });

      const { graphQLErrors } = await promise.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Senha incorreta!');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
      expect(graphQLErrors[0].extensions.response.error).toBe('Unauthorized');
    });
  });
});
