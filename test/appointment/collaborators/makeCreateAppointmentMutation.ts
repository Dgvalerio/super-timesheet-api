import { CreateAppointmentInput } from '@/appointment/dto/create-appointment.input';

import { gql } from 'apollo-boost';

export const makeCreateAppointmentMutation = (
  input: Partial<CreateAppointmentInput>,
) => {
  return gql`
    mutation {
      createAppointment(input: {
        code: "${input.code}"
        date: "${input.date}"
        startTime: "${input.startTime}"
        endTime: "${input.endTime}"
        notMonetize: ${input.notMonetize}
        description: "${input.description}"
        commit: "${input.commit}"
        status: ${input.status}

        userId: "${input.userId}"
        userEmail: "${input.userEmail}"

        projectId: "${input.projectId}"
        projectCode: "${input.projectCode}"

        categoryId: "${input.categoryId}"
        categoryName: "${input.categoryName}"
        categoryCode: "${input.categoryCode}"
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
