import { GetProjectInput } from '@/project/dto';

import { gql } from 'apollo-boost';

export const makeGetAppointmentQuery = (input: GetProjectInput) => {
  if (input.id)
    return gql`
      query {
        getAppointment(input: { id: "${input.id}" }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
            id
            code
            name
            startDate
            endDate
            client {
              id
              code
              name
            }
          }
          category {
            id
            code
            name
          }
        }
      }
    `;
  if (input.code)
    return gql`
      query {
        getAppointment(input: { code: "${input.code}" }) {
          id
          code
          date
          startTime
          endTime
          notMonetize
          description
          commit
          status
          user {
            id
            name
            email
          }
          project {
            id
            code
            name
            startDate
            endDate
            client {
              id
              code
              name
            }
          }
          category {
            id
            code
            name
          }
        }
      }
    `;

  return gql`
    query {
      getAppointment(input: {}) {
        id
        code
        date
        startTime
        endTime
        notMonetize
        description
        commit
        status
        user {
          id
          name
          email
        }
        project {
          id
          code
          name
          startDate
          endDate
          client {
            id
            code
            name
          }
        }
        category {
          id
          code
          name
        }
      }
    }
  `;
};
