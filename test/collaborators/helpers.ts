import { apolloClient } from '!/collaborators/apolloClient';

import { DocumentNode } from 'apollo-boost';

export const shouldThrowIfUnauthenticated = (
  action: 'query' | 'mutation',
  node: DocumentNode,
) => {
  it('should throw if unauthenticated', async () => {
    let out;

    switch (action) {
      case 'query':
        out = apolloClient.query({ query: node });
        break;
      case 'mutation':
        out = apolloClient.mutate({ mutation: node });
        break;
    }

    const { graphQLErrors } = await out.catch((e) => e);

    expect(graphQLErrors[0].message).toBe('Unauthorized');
    expect(graphQLErrors[0].extensions).toHaveProperty('response');
    expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
  });
};
