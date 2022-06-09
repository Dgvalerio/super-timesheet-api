import { CreateUserInput } from '@/user/dto/create-user.input';

import { gql } from 'apollo-boost';

export const makeCreateUserMutation = ({
  name,
  email,
  password,
  passwordConfirmation,
}: Partial<CreateUserInput>) => gql`
  mutation {
    createUser(input: {
      name: "${name}"
      email: "${email}"
      password: "${password}"
      passwordConfirmation: "${passwordConfirmation}"
    }) {
      id
      email
      name
    }
  }
`;
