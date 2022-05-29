import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';

import { gql } from 'apollo-boost';

export const makeDeleteAppointmentMutation = (
  input: DeleteAppointmentInput,
) => {
  if (input.id)
    return gql`
      mutation {
        deleteAppointment(input: {
          id: "${input.id}"
        })
      }
    `;
  if (input.code)
    return gql`
      mutation {
        deleteAppointment(input: {
          code: "${input.code}"
        })
      }
    `;

  return gql`
    mutation {
      deleteAppointment(input: {})
    }
  `;
};
