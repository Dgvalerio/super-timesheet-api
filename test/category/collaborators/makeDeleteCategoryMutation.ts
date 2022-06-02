import { DeleteCategoryInput } from '@/category/dto/delete-category.input';

import { gql } from 'apollo-boost';

export const makeDeleteCategoryMutation = (input: DeleteCategoryInput) => {
  if (input.id)
    return gql`
      mutation {
        deleteCategory(input: {
          id: "${input.id}"
        })
      }
    `;
  if (input.code)
    return gql`
      mutation {
        deleteCategory(input: {
          code: "${input.code}"
        })
      }
    `;

  return gql`
    mutation {
      deleteCategory(input: {})
    }
  `;
};
