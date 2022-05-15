import { AuthInput } from '@/auth/dto/auth.input';

import { gql } from 'apollo-boost';

export const makeLoginMutation = ({ email, password }: AuthInput) => gql`
  mutation {
    login(input: { email: "${email}", password: "${password}" }) {
      user {
        id
        email
        name
      }
      token
    }
  }
`;
