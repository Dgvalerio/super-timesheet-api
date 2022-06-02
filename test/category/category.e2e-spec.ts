import { Category } from '@/category/category.entity';
import { CreateCategoryInput } from '@/category/dto/create-category.input';
import { DeleteCategoryInput } from '@/category/dto/delete-category.input';
import { GetCategoryInput } from '@/category/dto/get-category.input';
import { randWord } from '@ngneat/falso';

import { makeCreateCategoryInput } from '!/category/collaborators/makeCreateCategoryInput';
import { makeCreateCategoryMutation } from '!/category/collaborators/makeCreateCategoryMutation';
import { makeDeleteCategoryMutation } from '!/category/collaborators/makeDeleteCategoryMutation';
import { makeGetAllCategoriesQuery } from '!/category/collaborators/makeGetAllCategoriesQuery';
import { makeGetCategoryQuery } from '!/category/collaborators/makeGetCategoryQuery';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { randCode } from '!/collaborators/randMore';

describe('Graphql Category Module (e2e)', () => {
  const api = new ApolloClientHelper();

  beforeAll(async () => {
    await api.authenticate();
  });

  describe('createCategory', () => {
    const makeOut = async (input: Partial<CreateCategoryInput>) =>
      api.mutation<{ createCategory: Category }>(
        makeCreateCategoryMutation(input),
      );

    shouldThrowIfUnauthenticated('mutation', makeCreateCategoryMutation({}));

    it('should throw if enter a empty name', async () => {
      const out = makeOut({ ...makeCreateCategoryInput(), name: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('name', graphQLErrors);
    });

    it('should create without code', async () => {
      const createCategoryInput = makeCreateCategoryInput();

      delete createCategoryInput.code;

      const { data } = await makeOut(createCategoryInput);

      expect(data).toHaveProperty('createCategory');

      expect(data.createCategory).toEqual({
        __typename: 'Category',
        id: expect.anything(),
        name: createCategoryInput.name,
      });
    });

    it('should create with code', async () => {
      const createCategoryInput = makeCreateCategoryInput();

      const { data } = await makeOut(createCategoryInput);

      expect(data).toHaveProperty('createCategory');

      expect(data.createCategory).toEqual({
        __typename: 'Category',
        id: expect.anything(),
        name: createCategoryInput.name,
        code: createCategoryInput.code,
      });
    });

    it('should fail if name already been registered', async () => {
      const { data } = await makeOut(makeCreateCategoryInput());

      const createCategoryInput = makeCreateCategoryInput();

      createCategoryInput.name = data.createCategory.name;

      const out = makeOut(createCategoryInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse nome já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });

    it('should fail if code already been registered', async () => {
      const a = makeCreateCategoryInput();

      const { data } = await makeOut(a);

      const createCategoryInput = makeCreateCategoryInput();

      createCategoryInput.code = data.createCategory.code;

      const out = makeOut(createCategoryInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse código já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });
  });

  describe('getAllCategories', () => {
    let category: Category;

    const makeOut = async () =>
      api.query<{ getAllCategories: Category[] }>(makeGetAllCategoriesQuery());

    beforeAll(async () => {
      const createCategoryInput = makeCreateCategoryInput();

      const createdCategory = await api.mutation<{ createCategory: Category }>(
        makeCreateCategoryMutation(createCategoryInput),
      );

      category = {
        ...createCategoryInput,
        ...createdCategory.data.createCategory,
      };
    });

    shouldThrowIfUnauthenticated('query', makeGetAllCategoriesQuery());

    it('should get all and list', async () => {
      const { data } = await makeOut();

      expect(data).toHaveProperty('getAllCategories');

      expect(Array.isArray(data.getAllCategories)).toBeTruthy();
      expect(data.getAllCategories.length >= 1).toBeTruthy();
      expect(
        data.getAllCategories.find(({ id }) => category.id === id),
      ).toEqual({
        __typename: 'Category',
        id: category.id,
        name: category.name,
        code: category.code,
      });
    });
  });

  describe('getCategory', () => {
    let category: Category;

    const makeOut = async (input: Partial<GetCategoryInput>) =>
      api.query<{ getCategory: Category }>(makeGetCategoryQuery(input));

    beforeAll(async () => {
      const createCategoryInput = makeCreateCategoryInput();

      const createdCategory = await api.mutation<{ createCategory: Category }>(
        makeCreateCategoryMutation(createCategoryInput),
      );

      category = {
        ...createCategoryInput,
        ...createdCategory.data.createCategory,
      };
    });

    shouldThrowIfUnauthenticated('query', makeGetCategoryQuery({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe(
        'Nenhum parâmetro válido foi informado',
      );
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.error).toBe('Bad Request');
    });

    it('should get and show by id', async () => {
      const { data } = await makeOut({ id: category.id });

      expect(data).toHaveProperty('getCategory');
      expect(data.getCategory).toEqual({
        __typename: 'Category',
        id: category.id,
        name: category.name,
        code: category.code,
      });
    });

    it('should get and show by name', async () => {
      const { data } = await makeOut({ name: category.name });

      expect(data).toHaveProperty('getCategory');
      expect(data.getCategory).toEqual({
        __typename: 'Category',
        id: category.id,
        name: category.name,
        code: category.code,
      });
    });

    it('should get and show by code', async () => {
      const { data } = await makeOut({ code: category.code });

      expect(data).toHaveProperty('getCategory');
      expect(data.getCategory).toEqual({
        __typename: 'Category',
        id: category.id,
        name: category.name,
        code: category.code,
      });
    });

    it('should throw if not found', async () => {
      const out = makeOut({ name: `${randWord()}_${category.id}` });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhuma categoria foi encontrada');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });

  describe('deleteCategory', () => {
    let category: Category;

    const makeOut = async (input: Partial<DeleteCategoryInput>) =>
      api.mutation<{ deleteCategory: Category }>(
        makeDeleteCategoryMutation(input),
      );

    beforeEach(async () => {
      const input = makeCreateCategoryInput();

      const {
        data: { createCategory },
      } = await api.mutation<{ createCategory: Category }>(
        makeCreateCategoryMutation(input),
      );

      category = createCategory;
    });

    shouldThrowIfUnauthenticated('mutation', makeDeleteCategoryMutation({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['Nenhum parâmetro válido foi informado'],
      });
    });

    it('should delete by id', async () => {
      const { data } = await makeOut({ id: category.id });

      expect(data).toHaveProperty('deleteCategory');
      expect(data.deleteCategory).toBeTruthy();
    });

    it('should delete by code', async () => {
      const { data } = await makeOut({ code: category.code });

      expect(data).toHaveProperty('deleteCategory');
      expect(data.deleteCategory).toBeTruthy();
    });

    it('should throw if not found category', async () => {
      const out = makeOut({ code: randCode() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'A categoria informada não existe!',
      });
    });
  });
});
