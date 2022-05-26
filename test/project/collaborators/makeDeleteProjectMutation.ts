import { DeleteProjectInput } from '@/project/dto';

import { gql } from 'apollo-boost';

export const makeDeleteProjectMutation = (input: DeleteProjectInput) => {
  if (input.id)
    return gql`
      mutation {
        deleteProject(input: {
          id: "${input.id}"
        })
      }
    `;
  if (input.code)
    return gql`
      mutation {
        deleteProject(input: {
          code: "${input.code}"
        })
      }
    `;

  return gql`
    mutation {
      deleteProject(input: {})
    }
  `;
};
