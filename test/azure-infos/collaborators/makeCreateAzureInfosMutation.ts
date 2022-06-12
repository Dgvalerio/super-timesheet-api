import { CreateAzureInfosInput } from '@/azure-infos/dto/create-azure-infos.input';

import { gql } from 'apollo-boost';

export const makeCreateAzureInfosMutation = (
  input: Partial<CreateAzureInfosInput>,
) => {
  if (input.userId) {
    return gql`
      mutation {
        createAzureInfos(input: {
          login: "${input.login}"
          password: "${input.password}"

          userId: "${input.userId}"
        }) {
          id
          login
          iv
          content
          currentMonthWorkedTime
          user {
            id
          }
        }
      }
    `;
  }

  if (input.userEmail) {
    return gql`
      mutation {
        createAzureInfos(input: {
          login: "${input.login}"
          password: "${input.password}"

          userEmail: "${input.userEmail}"
        }) {
          id
          login
          iv
          content
          currentMonthWorkedTime
          user {
            id
          }
        }
      }
    `;
  }

  return gql`
    mutation {
      createAzureInfos(input: {
        login: "${input.login}"
        password: "${input.password}"
      }) {
        id
        login
        iv
        content
        currentMonthWorkedTime
        user {
          id
        }
      }
    }
  `;
};
