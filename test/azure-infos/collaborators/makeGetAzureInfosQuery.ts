import { GetAzureInfosInput } from '@/azure-infos/dto/get-azure-infos.input';

import { gql } from 'apollo-boost';

export const makeGetAzureInfosQuery = (input: GetAzureInfosInput) => {
  if (input.id)
    return gql`
      query {
        getAzureInfos(input: { id: "${input.id}" }) {
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
  if (input.login)
    return gql`
      query {
        getAzureInfos(input: { login: "${input.login}" }) {
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

  return gql`
    query {
      getAzureInfos(input: {}) {
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
