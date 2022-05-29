import { UpdateProjectInput } from '@/project/dto';

import { gql } from 'apollo-boost';

export const makeUpdateAppointmentMutation = (
  input: Partial<UpdateProjectInput>,
) => {
  return gql`
    mutation {
      updateAppointment(input: {
        id: "${input.id}"
      }) {
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
