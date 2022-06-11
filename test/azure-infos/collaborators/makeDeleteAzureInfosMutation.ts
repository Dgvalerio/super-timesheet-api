import { DeleteAzureInfosInput } from '@/azure-infos/dto/delete-azure-infos.input';

import { gql } from 'apollo-boost';

export const makeDeleteAzureInfosMutation = (input: DeleteAzureInfosInput) => {
  if (input.id)
    return gql`
      mutation {
        deleteAzureInfos(input: {
          id: "${input.id}"
        })
      }
    `;
  if (input.login)
    return gql`
      mutation {
        deleteAzureInfos(input: {
          login: "${input.login}"
        })
      }
    `;

  return gql`
    mutation {
      deleteAzureInfos(input: {})
    }
  `;
};
