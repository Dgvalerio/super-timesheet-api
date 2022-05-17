import { AuthOutput } from '@/auth/dto/auth.output';
import { Client } from '@/client/client.entity';
import {
  CreateProjectInput,
  DeleteProjectInput,
  GetProjectInput,
} from '@/project/dto';
import { Project } from '@/project/project.entity';
import { randWord } from '@ngneat/falso';

import { makeLoginMutation } from '!/auth/collaborators/makeLoginMutation';
import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import {
  apolloAuthorizedClient,
  apolloClient,
} from '!/collaborators/apolloClient';
import { makeCreateProjectInput } from '!/project/collaborators/makeCreateProjectInput';
import { makeCreateProjectMutation } from '!/project/collaborators/makeCreateProjectMutation';
import { makeDeleteProjectMutation } from '!/project/collaborators/makeDeleteProjectMutation';
import { makeGetAllProjectsQuery } from '!/project/collaborators/makeGetAllProjectsQuery';
import { makeGetProjectQuery } from '!/project/collaborators/makeGetProjectQuery';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

import { ApolloClient, NormalizedCacheObject } from 'apollo-boost';

describe('Graphql Project Module (e2e)', () => {
  let api: ApolloClient<NormalizedCacheObject>;

  beforeAll(async () => {
    const createUserInput = makeCreateUserInput();

    await apolloClient.mutate({
      mutation: makeCreateUserMutation(createUserInput),
    });

    const {
      data: {
        login: { token },
      },
    } = await apolloClient.mutate<{ login: AuthOutput }>({
      mutation: makeLoginMutation({
        email: createUserInput.email,
        password: createUserInput.password,
      }),
    });

    api = apolloAuthorizedClient(token);
  });

  describe('createProject', () => {
    const makeOut = async (input: Partial<CreateProjectInput>) =>
      api.mutate<{ createProject: Project }>({
        mutation: makeCreateProjectMutation(input),
      });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.mutate<{ createProject: Project }>({
        mutation: makeCreateProjectMutation({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

    it('should throw if enter a empty name', async () => {
      const createProjectInput = makeCreateProjectInput();

      createProjectInput.name = '';

      const out = makeOut(createProjectInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('name should not be empty');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a empty startDate', async () => {
      const createProjectInput = makeCreateProjectInput();

      delete createProjectInput.startDate;

      const out = makeOut(createProjectInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('startDate must be a Date instance');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a empty endDate', async () => {
      const createProjectInput = makeCreateProjectInput();

      delete createProjectInput.endDate;

      const out = makeOut(createProjectInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('endDate must be a Date instance');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a empty clientId and clientCode', async () => {
      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = '';
      createProjectInput.clientCode = '';

      const out = makeOut(createProjectInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Bad Request Exception');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(400);
      expect(response.message[0]).toBe('clientId should not be empty');
      expect(response.message[1]).toBe('clientId must be a string');
      expect(response.message[2]).toBe('clientCode should not be empty');
      expect(response.message[3]).toBe('clientCode must be a string');
      expect(response.error).toBe('Bad Request');
    });

    it('should throw if enter a invalid client', async () => {
      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(makeCreateClientInput()),
      });

      const createProjectInput = makeCreateProjectInput();

      delete createProjectInput.code;
      createProjectInput.clientId = String(+createClient.id * 2);

      const out = makeOut(createProjectInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O cliente informado não existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });

    it('should create an project (with client id) (without project code)', async () => {
      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(makeCreateClientInput()),
      });

      const createProjectInput = makeCreateProjectInput();

      delete createProjectInput.code;
      createProjectInput.clientId = createClient.id;

      const { data } = await makeOut(createProjectInput);

      expect(data).toHaveProperty('createProject');

      createProjectInput.startDate.setMilliseconds(0);
      createProjectInput.endDate.setMilliseconds(0);

      expect(data.createProject).toEqual({
        __typename: 'Project',
        id: expect.anything(),
        name: createProjectInput.name,
        startDate: createProjectInput.startDate.toISOString(),
        endDate: createProjectInput.endDate.toISOString(),
        client: createClient,
      });
    });

    it('should create an project (with client code) (without project code)', async () => {
      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(makeCreateClientInput()),
      });

      const createProjectInput = makeCreateProjectInput();

      delete createProjectInput.code;
      createProjectInput.clientId = createClient.id;

      const { data } = await makeOut(createProjectInput);

      expect(data).toHaveProperty('createProject');

      createProjectInput.startDate.setMilliseconds(0);
      createProjectInput.endDate.setMilliseconds(0);

      expect(data.createProject).toEqual({
        __typename: 'Project',
        id: expect.anything(),
        name: createProjectInput.name,
        startDate: createProjectInput.startDate.toISOString(),
        endDate: createProjectInput.endDate.toISOString(),
        client: createClient,
      });
    });

    it('should create an project (with client id) (with project code)', async () => {
      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(makeCreateClientInput()),
      });

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const { data } = await makeOut(createProjectInput);

      expect(data).toHaveProperty('createProject');

      createProjectInput.startDate.setMilliseconds(0);
      createProjectInput.endDate.setMilliseconds(0);

      expect(data.createProject).toEqual({
        __typename: 'Project',
        id: expect.anything(),
        code: createProjectInput.code,
        name: createProjectInput.name,
        startDate: createProjectInput.startDate.toISOString(),
        endDate: createProjectInput.endDate.toISOString(),
        client: createClient,
      });
    });

    it('should create an project (with client code) (with project code)', async () => {
      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(makeCreateClientInput()),
      });

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const { data } = await makeOut(createProjectInput);

      expect(data).toHaveProperty('createProject');

      createProjectInput.startDate.setMilliseconds(0);
      createProjectInput.endDate.setMilliseconds(0);

      expect(data.createProject).toEqual({
        __typename: 'Project',
        id: expect.anything(),
        code: createProjectInput.code,
        name: createProjectInput.name,
        startDate: createProjectInput.startDate.toISOString(),
        endDate: createProjectInput.endDate.toISOString(),
        client: createClient,
      });
    });

    it('should fail if entered code already been registered', async () => {
      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(makeCreateClientInput()),
      });

      const { data } = await makeOut({
        ...makeCreateProjectInput(),
        clientId: createClient.id,
      });

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;
      createProjectInput.code = data.createProject.code;

      const out = makeOut(createProjectInput);

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse código já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });
  });

  describe('getAllProjects', () => {
    let project: Project;

    const makeOut = async () =>
      api.query<{ getAllProjects: Project[] }>({
        query: makeGetAllProjectsQuery(),
      });

    beforeAll(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(createClientInput),
      });

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutate<{ createProject: Project }>({
        mutation: makeCreateProjectMutation(createProjectInput),
      });

      project = { ...createProjectInput, ...createProject };
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getAllProjects: Project[] }>({
        query: makeGetAllProjectsQuery(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

    it('should get and list all projects', async () => {
      const { data } = await makeOut();

      expect(data).toHaveProperty('getAllProjects');

      expect(Array.isArray(data.getAllProjects)).toBeTruthy();
      expect(data.getAllProjects.length >= 1).toBeTruthy();
      expect(data.getAllProjects.find(({ id }) => project.id === id)).toEqual({
        __typename: 'Project',
        id: project.id,
        name: project.name,
        code: project.code,
        startDate: project.startDate,
        endDate: project.endDate,
        client: project.client,
      });
    });
  });

  describe('getProject', () => {
    let project: Project;

    const makeOut = async (input: Partial<GetProjectInput>) =>
      api.query<{ getProject: Project }>({
        query: makeGetProjectQuery(input),
      });

    beforeAll(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(createClientInput),
      });

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutate<{ createProject: Project }>({
        mutation: makeCreateProjectMutation(createProjectInput),
      });

      project = { ...createProjectInput, ...createProject };
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getProject: Project }>({
        query: makeGetProjectQuery({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

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
      const { data } = await makeOut({ id: project.id });

      expect(data).toHaveProperty('getProject');
      expect(data.getProject).toEqual({
        __typename: 'Project',
        id: project.id,
        name: project.name,
        code: project.code,
        startDate: project.startDate,
        endDate: project.endDate,
        client: project.client,
      });
    });

    it('should get and show by name', async () => {
      const { data } = await makeOut({ name: project.name });

      expect(data).toHaveProperty('getProject');
      expect(data.getProject).toEqual({
        __typename: 'Project',
        id: project.id,
        name: project.name,
        code: project.code,
        startDate: project.startDate,
        endDate: project.endDate,
        client: project.client,
      });
    });

    it('should get and show by code', async () => {
      const { data } = await makeOut({ code: project.code });

      expect(data).toHaveProperty('getProject');
      expect(data.getProject).toEqual({
        __typename: 'Project',
        id: project.id,
        name: project.name,
        code: project.code,
        startDate: project.startDate,
        endDate: project.endDate,
        client: project.client,
      });
    });

    it('should throw if not found project', async () => {
      const out = makeOut({ name: `${randWord()}_${project.id}` });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Nenhum projeto foi encontrado');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });

  describe('deleteProject', () => {
    let project: Project;

    const makeOut = async (input: Partial<DeleteProjectInput>) =>
      api.mutate<{ deleteProject: Project }>({
        mutation: makeDeleteProjectMutation(input),
      });

    beforeEach(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutate<{ createClient: Client }>({
        mutation: makeCreateClientMutation(createClientInput),
      });

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutate<{ createProject: Project }>({
        mutation: makeCreateProjectMutation(createProjectInput),
      });

      project = { ...createProjectInput, ...createProject };
    });

    it('should throw if unauthenticated', async () => {
      const out = apolloClient.query<{ getProject: Project }>({
        query: makeGetProjectQuery({}),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Unauthorized');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');
      expect(graphQLErrors[0].extensions.response.statusCode).toBe(401);
    });

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
      const { data } = await makeOut({ id: project.id });

      expect(data).toHaveProperty('deleteProject');
      expect(data.deleteProject).toBeTruthy();
    });

    it('should get and show by name', async () => {
      const { data } = await makeOut({ name: project.name });

      expect(data).toHaveProperty('deleteProject');
      expect(data.deleteProject).toBeTruthy();
    });

    it('should get and show by code', async () => {
      const { data } = await makeOut({ code: project.code });

      expect(data).toHaveProperty('deleteProject');
      expect(data.deleteProject).toBeTruthy();
    });

    it('should throw if not found project', async () => {
      const out = makeOut({ name: `${randWord()}_${project.id}` });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O projeto informado não existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });
  });
});
