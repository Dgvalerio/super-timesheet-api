import { CreateClientInput } from '@/client/dto/create-client.input';

import { gql } from 'apollo-boost';

export const makeCreateClientMutation = (input: Partial<CreateClientInput>) => {
  if (input.code)
    return gql`
      mutation {
        createClient(input: {
          code: "${input.code}"
          name: "${input.name}"
        }) {
          id
          code
          name
        }
      }
    `;

  return gql`
    mutation {
      createClient(input: {
        name: "${input.name}"
      }) {
        id
        name
      }
    }
  `;
};
