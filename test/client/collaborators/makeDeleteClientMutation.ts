import { DeleteClientInput } from '@/client/dto/delete-client.input';

import { gql } from 'apollo-boost';

export const makeDeleteClientMutation = (input: DeleteClientInput) => {
  if (input.id)
    return gql`
      mutation {
        deleteClient(input: {
          id: "${input.id}"
        })
      }
    `;
  if (input.code)
    return gql`
      mutation {
        deleteClient(input: {
          code: "${input.code}"
        })
      }
    `;

  return gql`
    mutation {
      deleteClient(input: {})
    }
  `;
};
