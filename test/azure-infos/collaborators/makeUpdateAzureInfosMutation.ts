import { UpdateAzureInfosInput } from '@/azure-infos/dto/update-azure-infos.input';

import { gql } from 'apollo-boost';

export const makeUpdateAzureInfosMutation = (
  input: Partial<UpdateAzureInfosInput>,
) => {
  if (input.login || input.login === '') {
    return gql`
      mutation {
        updateAzureInfos(input: {
          id: "${input.id}"
          login: "${input.login}"
        }) {
          id
          login
          iv
          content
          user {
            id
          }
        }
      }
    `;
  }
  if (input.password || input.password === '') {
    return gql`
      mutation {
        updateAzureInfos(input: {
          id: "${input.id}"
          password: "${input.password}"
        }) {
          id
          login
          iv
          content
          user {
            id
          }
        }
      }
    `;
  }

  return gql`
    mutation {
      updateAzureInfos(input: {
        id: "${input.id}"
      }) {
        id
        login
        iv
        content
        user {
          id
        }
      }
    }
  `;
};
