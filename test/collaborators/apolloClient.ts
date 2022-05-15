import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost';
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
