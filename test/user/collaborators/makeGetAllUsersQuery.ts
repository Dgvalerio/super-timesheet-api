import { gql } from 'apollo-boost';

export const makeGetAllUsersQuery = () => gql`
  query {
    getAllUsers {
      id
      email
      name
    }
  }
`;
