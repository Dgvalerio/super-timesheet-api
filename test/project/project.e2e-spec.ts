import { Client } from '@/client/client.entity';
import {
  CreateProjectInput,
  DeleteProjectInput,
  GetProjectInput,
  UpdateProjectInput,
} from '@/project/dto';
import { Project } from '@/project/project.entity';
import { randNumber, randWord } from '@ngneat/falso';

import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { randMore } from '!/collaborators/randMore';
import { makeCreateProjectInput } from '!/project/collaborators/makeCreateProjectInput';
import { makeCreateProjectMutation } from '!/project/collaborators/makeCreateProjectMutation';
import { makeDeleteProjectMutation } from '!/project/collaborators/makeDeleteProjectMutation';
import { makeGetAllProjectsQuery } from '!/project/collaborators/makeGetAllProjectsQuery';
import { makeGetProjectQuery } from '!/project/collaborators/makeGetProjectQuery';
import { makeUpdateProjectInput } from '!/project/collaborators/makeUpdateProjectInput';
import { makeUpdateProjectMutation } from '!/project/collaborators/makeUpdateProjectMutation';

describe('Graphql Project Module (e2e)', () => {
  const api = new ApolloClientHelper();

  beforeAll(async () => {
    await api.authenticate();
  });

  describe('createProject', () => {
    const makeOut = async (input: Partial<CreateProjectInput>) =>
      api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation(input),
      );

    shouldThrowIfUnauthenticated('mutation', makeCreateProjectMutation({}));

    it('should throw if enter a empty name', async () => {
      const out = makeOut({ ...makeCreateProjectInput(), name: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('name', graphQLErrors);
    });

    it('should throw if enter a invalid startDate', async () => {
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

    it('should throw if enter a invalid endDate', async () => {
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
      const out = makeOut({
        ...makeCreateProjectInput(),
        clientId: '',
        clientCode: '',
      });

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
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

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
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

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
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

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
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

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
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

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
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

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
      api.query<{ getAllProjects: Project[] }>(makeGetAllProjectsQuery());

    beforeAll(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(createClientInput),
      );

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation(createProjectInput),
      );

      project = { ...createProjectInput, ...createProject };
    });

    shouldThrowIfUnauthenticated('query', makeGetAllProjectsQuery());

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
      api.query<{ getProject: Project }>(makeGetProjectQuery(input));

    beforeAll(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(createClientInput),
      );

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation(createProjectInput),
      );

      project = { ...createProjectInput, ...createProject };
    });

    shouldThrowIfUnauthenticated('query', makeGetProjectQuery({}));

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

  describe('updateProject', () => {
    let project: Project;

    const makeOut = async (input: Partial<UpdateProjectInput>) =>
      api.mutation<{ updateProject: Project }>(
        makeUpdateProjectMutation(input),
      );

    beforeEach(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(createClientInput),
      );

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation(createProjectInput),
      );

      project = createProject;
    });

    shouldThrowIfUnauthenticated('mutation', makeUpdateProjectMutation({}));

    it('should throw if enter a empty id', async () => {
      const out = makeOut({ id: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('id', graphQLErrors);
    });

    it('should throw if enter a invalid id', async () => {
      const updateProjectInput = makeUpdateProjectInput();

      updateProjectInput.id = String(+project.id * 2);

      const out = makeOut({ id: updateProjectInput.id });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O projeto informado não existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });

    it('should throw if enter a empty code', async () => {
      const out = makeOut({ id: project.id, code: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('code', graphQLErrors);
    });

    it('should throw if enter a code that has already been registered', async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(createClientInput),
      );

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation(createProjectInput),
      );

      const out = makeOut({
        id: project.id,
        code: createProject.code,
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('Esse código já foi utilizado!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(409);
      expect(response.error).toBe('Conflict');
    });

    it('should update the code', async () => {
      const { code } = makeUpdateProjectInput();

      const { data } = await makeOut({
        id: project.id,
        code,
      });

      expect(data).toHaveProperty('updateProject');

      expect(data.updateProject).toEqual({
        __typename: 'Project',
        ...project,
        code,
      });
    });

    it('should throw if enter a empty name', async () => {
      const out = makeOut({ id: project.id, name: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('name', graphQLErrors);
    });

    it('should update the name', async () => {
      const { name } = makeUpdateProjectInput();

      const { data } = await makeOut({
        id: project.id,
        name,
      });

      expect(data).toHaveProperty('updateProject');

      expect(data.updateProject).toEqual({
        __typename: 'Project',
        ...project,
        name,
      });
    });

    it('should update the startDate', async () => {
      const { startDate } = makeUpdateProjectInput();

      const { data } = await makeOut({
        id: project.id,
        startDate,
      });

      expect(data).toHaveProperty('updateProject');

      startDate.setMilliseconds(0);

      expect(data.updateProject).toEqual({
        __typename: 'Project',
        ...project,
        startDate: startDate.toISOString(),
      });
    });

    it('should update the endDate', async () => {
      const { endDate } = makeUpdateProjectInput();

      const { data } = await makeOut({
        id: project.id,
        endDate,
      });

      expect(data).toHaveProperty('updateProject');

      endDate.setMilliseconds(0);

      expect(data.updateProject).toEqual({
        __typename: 'Project',
        ...project,
        endDate: endDate.toISOString(),
      });
    });

    it('should throw if enter a empty clientId', async () => {
      const out = makeOut({ id: project.id, clientId: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('clientId', graphQLErrors);
    });

    it('should throw if enter a invalid clientId', async () => {
      const out = makeOut({
        id: project.id,
        clientId: String(randNumber()),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O cliente informado não existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });

    it('should throw if enter a empty clientCode', async () => {
      const out = makeOut({ id: project.id, clientCode: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('clientCode', graphQLErrors);
    });

    it('should throw if enter a invalid clientCode', async () => {
      const out = makeOut({
        id: project.id,
        clientCode: randMore(String(randNumber())),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      expect(graphQLErrors[0].message).toBe('O cliente informado não existe!');
      expect(graphQLErrors[0].extensions).toHaveProperty('response');

      const { response } = graphQLErrors[0].extensions;

      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
    });

    it('should update the client (with client id)', async () => {
      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

      const { data } = await makeOut({
        id: project.id,
        clientId: createClient.id,
      });

      expect(data).toHaveProperty('updateProject');

      expect(data.updateProject).toEqual({
        __typename: 'Project',
        ...project,
        client: createClient,
      });
    });

    it('should update the client (with client code)', async () => {
      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

      const { data } = await makeOut({
        id: project.id,
        clientCode: createClient.code,
      });

      expect(data).toHaveProperty('updateProject');

      expect(data.updateProject).toEqual({
        __typename: 'Project',
        ...project,
        client: createClient,
      });
    });
  });

  describe('deleteProject', () => {
    let project: Project;

    const makeOut = async (input: Partial<DeleteProjectInput>) =>
      api.mutation<{ deleteProject: Project }>(
        makeDeleteProjectMutation(input),
      );

    beforeEach(async () => {
      const createClientInput = makeCreateClientInput();

      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(createClientInput),
      );

      const createProjectInput = makeCreateProjectInput();

      createProjectInput.clientId = createClient.id;

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation(createProjectInput),
      );

      project = { ...createProjectInput, ...createProject };
    });

    shouldThrowIfUnauthenticated('mutation', makeDeleteProjectMutation({}));

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

    it('should delete by id', async () => {
      const { data } = await makeOut({ id: project.id });

      expect(data).toHaveProperty('deleteProject');
      expect(data.deleteProject).toBeTruthy();
    });

    it('should delete by name', async () => {
      const { data } = await makeOut({ name: project.name });

      expect(data).toHaveProperty('deleteProject');
      expect(data.deleteProject).toBeTruthy();
    });

    it('should delete by code', async () => {
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
