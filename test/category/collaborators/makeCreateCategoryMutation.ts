import { CreateCategoryInput } from '@/category/dto/create-category.input';

import { gql } from 'apollo-boost';

export const makeCreateCategoryMutation = (
  input: Partial<CreateCategoryInput>,
) => {
  if (input.code)
    return gql`
      mutation {
        createCategory(input: {
          code: "${input.code}"
          name: "${input.name}"
        }) {
          id
          code
          name
        }
      }
    `;

  return gql`
    mutation {
      createCategory(input: {
        name: "${input.name}"
      }) {
        id
        name
      }
    }
  `;
};
