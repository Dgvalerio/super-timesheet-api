import { DeleteUserInput } from '@/user/dto/delete-user.input';

import { gql } from 'apollo-boost';

export const makeDeleteUserMutation = (input: Partial<DeleteUserInput>) => {
  if (input.id)
    return gql`
      mutation {
        deleteUser(input: {
          id: "${input.id}"
        })
      }
    `;
  if (input.email)
    return gql`
      mutation {
        deleteUser(input: {
          email: "${input.email}"
        })
      }
    `;

  return gql`
    mutation {
      deleteUser(input: {})
    }
  `;
};
