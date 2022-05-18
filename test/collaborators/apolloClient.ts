import { AuthOutput } from '@/auth/dto/auth.output';

import { makeLoginMutation } from '!/auth/collaborators/makeLoginMutation';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

import {
  ApolloClient,
  DocumentNode,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from 'apollo-boost';
import fetch from 'cross-fetch';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3001/graphql', fetch }),
  cache: new InMemoryCache(),
});

export const apolloAuthorizedClient = (token: string) =>
  new ApolloClient({
    link: new HttpLink({
      uri: 'http://localhost:3001/graphql',
      fetch,
      headers: {
        authorization: `Bearer ${token}`,
      },
    }),
    cache: new InMemoryCache(),
  });

export class ApolloClientHelper {
  client: ApolloClient<NormalizedCacheObject>;

  constructor(token?: string) {
    this.client = token ? apolloAuthorizedClient(token) : apolloClient;
  }

  public async authenticate() {
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

    this.client = apolloAuthorizedClient(token);
  }

  async mutation<Return>(mutationNode: DocumentNode) {
    return this.client.mutate<Return>({ mutation: mutationNode });
  }

  async query<Return>(queryNode: DocumentNode) {
    return this.client.query<Return>({ query: queryNode });
  }
}
