import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { CreateAppointmentInput } from '@/appointment/dto/create-appointment.input';
import { DeleteAppointmentInput } from '@/appointment/dto/delete-appointment.input';
import { GetAppointmentInput } from '@/appointment/dto/get-appointment.input';
import { UpdateAppointmentInput } from '@/appointment/dto/update-appointment.input';
import { Category } from '@/category/category.entity';
import { Client } from '@/client/client.entity';
import { getNow, today } from '@/common/helpers/today';
import { Project } from '@/project/project.entity';
import { User } from '@/user/user.entity';
import { randFutureDate, randWord } from '@ngneat/falso';

import { makeCreateAppointmentInput } from '!/appointment/collaborators/makeCreateAppointmentInput';
import { makeCreateAppointmentMutation } from '!/appointment/collaborators/makeCreateAppointmentMutation';
import { makeDeleteAppointmentMutation } from '!/appointment/collaborators/makeDeleteAppointmentMutation';
import { makeFakeAppointment } from '!/appointment/collaborators/makeFakeAppointment';
import { makeGetAllAppointmentsQuery } from '!/appointment/collaborators/makeGetAllAppointmentsQuery';
import { makeGetAppointmentQuery } from '!/appointment/collaborators/makeGetAppointmentQuery';
import { makeUpdateAppointmentMutation } from '!/appointment/collaborators/makeUpdateAppointmentMutation';
import { makeCreateCategoryInput } from '!/category/collaborators/makeCreateCategoryInput';
import { makeCreateCategoryMutation } from '!/category/collaborators/makeCreateCategoryMutation';
import { makeCreateClientInput } from '!/client/collaborators/makeCreateClientInput';
import { makeCreateClientMutation } from '!/client/collaborators/makeCreateClientMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import {
  shouldThrowHelper,
  shouldThrowIfEnterAEmptyParam,
  shouldThrowIfUnauthenticated,
} from '!/collaborators/helpers';
import { randCode, randId } from '!/collaborators/randMore';
import { makeCreateProjectInput } from '!/project/collaborators/makeCreateProjectInput';
import { makeCreateProjectMutation } from '!/project/collaborators/makeCreateProjectMutation';
import { makeCreateUserInput } from '!/user/collaborators/makeCreateUserInput';
import { makeCreateUserMutation } from '!/user/collaborators/makeCreateUserMutation';

import { add, format, sub } from 'date-fns';

describe('Graphql Appointment Module (e2e)', () => {
  const api = new ApolloClientHelper();
  let user: User;
  let project: Project;
  let category: Category;

  beforeAll(async () => {
    await api.authenticate();

    const {
      data: { createUser },
    } = await api.mutation<{ createUser: User }>(
      makeCreateUserMutation(makeCreateUserInput()),
    );

    user = createUser;

    const {
      data: { createClient },
    } = await api.mutation<{ createClient: Client }>(
      makeCreateClientMutation(makeCreateClientInput()),
    );

    const {
      data: { createProject },
    } = await api.mutation<{ createProject: Project }>(
      makeCreateProjectMutation({
        ...makeCreateProjectInput(),
        clientId: createClient.id,
      }),
    );

    project = createProject;

    const {
      data: { createCategory },
    } = await api.mutation<{ createCategory: Category }>(
      makeCreateCategoryMutation(makeCreateCategoryInput()),
    );

    category = createCategory;
  });

  describe('createAppointment', () => {
    const makeOut = async (input: Partial<CreateAppointmentInput>) =>
      api.mutation<{ createAppointment: Appointment }>(
        makeCreateAppointmentMutation(input),
      );

    shouldThrowIfUnauthenticated(
      'mutation',
      makeCreateAppointmentMutation(makeCreateAppointmentInput()),
    );

    it('should throw if enter a invalid date', async () => {
      const input = makeCreateAppointmentInput();

      input.date = new Date(randFutureDate());

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          `The date must not go beyond today (${sub(today(), {
            hours: 3,
          }).toISOString()})`,
        ],
      });
    });

    it('should throw if enter a actual time in startTime', async () => {
      const now = getNow();
      const input = makeCreateAppointmentInput();

      input.date = now;
      input.startTime = format(now, 'HH:mm');

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio inicial precisa ser menor que o atual'],
      });
    });

    it('should throw if enter a startTime longer than endTime', async () => {
      const now = getNow();
      const input = makeCreateAppointmentInput();

      input.date = now;
      input.startTime = format(sub(now, { minutes: 1 }), 'HH:mm');
      input.endTime = format(sub(now, { minutes: 2 }), 'HH:mm');

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio inicial precisa ser menor que o final'],
      });
    });

    it('should throw if enter a endTime longer than actual', async () => {
      const now = getNow();
      const input = makeCreateAppointmentInput();

      input.date = now;
      input.startTime = format(sub(now, { minutes: 1 }), 'HH:mm');
      input.endTime = format(add(now, { minutes: 2 }), 'HH:mm');

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio final n??o deve ser maior que o atual'],
      });
    });

    it('should throw if enter a empty startTime', async () => {
      const out = makeOut({ ...makeCreateAppointmentInput(), startTime: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('startTime', graphQLErrors);
    });

    it('should throw if enter a invalid startTime', async () => {
      const out = makeOut({
        ...makeCreateAppointmentInput(),
        startTime: randWord(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'startTime must be a valid representation of military time in the format HH:MM',
        ],
      });
    });

    it('should throw if enter a empty endTime', async () => {
      const out = makeOut({ ...makeCreateAppointmentInput(), endTime: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('endTime', graphQLErrors);
    });

    it('should throw if enter a invalid startTime', async () => {
      const out = makeOut({
        ...makeCreateAppointmentInput(),
        endTime: randWord(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'endTime must be a valid representation of military time in the format HH:MM',
        ],
      });
    });

    it('should throw if enter a empty description', async () => {
      const out = makeOut({ ...makeCreateAppointmentInput(), description: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('description', graphQLErrors);
    });

    it('should throw if enter a empty userId and userEmail', async () => {
      const out = makeOut({
        ...makeCreateAppointmentInput(),
        userId: '',
        userEmail: '',
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'userEmail should not be empty',
          'userEmail must be an email',
          'userId should not be empty',
        ],
      });
    });

    it('should throw if enter a invalid user', async () => {
      const out = makeOut({
        ...makeCreateAppointmentInput(),
        userId: randId(),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'O usu??rio informado n??o existe!',
      });
    });

    it('should throw if enter a empty projectId and projectCode', async () => {
      const out = makeOut({
        ...makeCreateAppointmentInput(),
        projectId: '',
        projectCode: '',
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'projectCode should not be empty',
          'projectId should not be empty',
        ],
      });
    });

    it('should throw if enter a invalid project', async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = randId();

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'O projeto informado n??o existe!',
      });
    });

    it('should throw if enter a empty categoryId, categoryCode and categoryName', async () => {
      const input = makeCreateAppointmentInput();

      input.categoryId = '';
      input.categoryCode = '';
      input.categoryName = '';

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'categoryId should not be empty',
          'categoryCode should not be empty',
          'categoryName should not be empty',
        ],
      });
    });

    it('should throw if enter a invalid category', async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = randId();

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'A categoria informada n??o existe!',
      });
    });

    it('should create an appointment', async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      const { data } = await makeOut(input);

      expect(data).toHaveProperty('createAppointment');

      input.date.setMilliseconds(0);

      expect(data.createAppointment).toEqual({
        __typename: 'Appointment',
        id: expect.anything(),
        code: input.code,
        date: input.date.toISOString(),
        startTime: input.startTime,
        endTime: input.endTime,
        notMonetize: input.notMonetize,
        description: input.description,
        commit: input.commit,
        status: input.status,
        user: { __typename: 'User', id: user.id },
        project: { __typename: 'Project', id: project.id },
        category: { __typename: 'Category', id: category.id },
      });
    });

    it('should create an appointment (without code)', async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      delete input.code;

      const { data } = await makeOut(input);

      expect(data).toHaveProperty('createAppointment');

      input.date.setMilliseconds(0);

      expect(data.createAppointment).toEqual({
        __typename: 'Appointment',
        id: expect.anything(),
        code: null,
        date: input.date.toISOString(),
        startTime: input.startTime,
        endTime: input.endTime,
        notMonetize: input.notMonetize,
        description: input.description,
        commit: input.commit,
        status: input.status,
        user: { __typename: 'User', id: user.id },
        project: { __typename: 'Project', id: project.id },
        category: { __typename: 'Category', id: category.id },
      });
    });

    it('should throw if enter a code already been registered', async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      const { data } = await makeOut(input);

      expect(data).toHaveProperty('createAppointment');

      input.date.setMilliseconds(0);

      expect(data.createAppointment).toEqual({
        __typename: 'Appointment',
        id: expect.anything(),
        code: input.code,
        date: input.date.toISOString(),
        startTime: input.startTime,
        endTime: input.endTime,
        notMonetize: input.notMonetize,
        description: input.description,
        commit: input.commit,
        status: input.status,
        user: { __typename: 'User', id: user.id },
        project: { __typename: 'Project', id: project.id },
        category: { __typename: 'Category', id: category.id },
      });

      const out = makeOut(input);

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Conflict',
        messages: 'Esse c??digo j?? foi utilizado!',
      });
    });
  });

  describe('getAllAppointments', () => {
    let appointments: Appointment[];

    beforeAll(async () => {
      const promise = [1, 2, 3].map(async () => {
        const input = makeCreateAppointmentInput();

        input.userId = user.id;
        input.projectId = project.id;
        input.categoryId = category.id;

        const {
          data: { createAppointment },
        } = await api.mutation<{ createAppointment: Appointment }>(
          makeCreateAppointmentMutation(input),
        );

        return createAppointment;
      });

      appointments = await Promise.all(promise);
    });

    const makeOut = async () =>
      api.query<{ getAllAppointments: Appointment[] }>(
        makeGetAllAppointmentsQuery(),
      );

    shouldThrowIfUnauthenticated('query', makeGetAllAppointmentsQuery());

    it('should get and list all appointments', async () => {
      const { data } = await makeOut();

      expect(data).toHaveProperty('getAllAppointments');

      expect(Array.isArray(data.getAllAppointments)).toBeTruthy();
      expect(data.getAllAppointments.length >= 3).toBeTruthy();

      appointments.forEach((appointment) =>
        expect(data.getAllAppointments).toContainEqual(appointment),
      );
    });
  });

  describe('getAppointment', () => {
    let appointment: Appointment;

    const makeOut = async (input: Partial<GetAppointmentInput>) =>
      api.query<{ getAppointment: Appointment }>(
        makeGetAppointmentQuery(input),
      );

    beforeAll(async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      const {
        data: { createAppointment },
      } = await api.mutation<{ createAppointment: Appointment }>(
        makeCreateAppointmentMutation(input),
      );

      appointment = createAppointment;
    });

    shouldThrowIfUnauthenticated('query', makeGetAppointmentQuery({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['Nenhum par??metro v??lido foi informado'],
      });
    });

    it('should get and show by id', async () => {
      const { data } = await makeOut({ id: appointment.id });

      expect(data).toHaveProperty('getAppointment');
      expect(data.getAppointment).toEqual({
        __typename: 'Appointment',
        id: expect.anything(),
        code: appointment.code,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notMonetize: appointment.notMonetize,
        description: appointment.description,
        commit: appointment.commit,
        status: appointment.status,
        user: { __typename: 'User', id: user.id },
        project: { __typename: 'Project', id: project.id },
        category: { __typename: 'Category', id: category.id },
      });
    });

    it('should get and show by code', async () => {
      const { data } = await makeOut({ code: appointment.code });

      expect(data).toHaveProperty('getAppointment');
      expect(data.getAppointment).toEqual({
        __typename: 'Appointment',
        id: expect.anything(),
        code: appointment.code,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notMonetize: appointment.notMonetize,
        description: appointment.description,
        commit: appointment.commit,
        status: appointment.status,
        user: { __typename: 'User', id: user.id },
        project: { __typename: 'Project', id: project.id },
        category: { __typename: 'Category', id: category.id },
      });
    });

    it('should throw if not found appointment', async () => {
      const out = makeOut({ code: randCode() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'Nenhum apontamento foi encontrado',
      });
    });
  });

  describe('updateAppointment', () => {
    let appointment: Appointment;

    const makeOut = async (input: Partial<UpdateAppointmentInput>) =>
      api.mutation<{ updateAppointment: Appointment }>(
        makeUpdateAppointmentMutation(input),
      );

    beforeEach(async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      const {
        data: { createAppointment },
      } = await api.mutation<{ createAppointment: Appointment }>(
        makeCreateAppointmentMutation(input),
      );

      appointment = createAppointment;
    });

    shouldThrowIfUnauthenticated('mutation', makeUpdateAppointmentMutation({}));

    it('should throw if enter a empty id', async () => {
      const out = makeOut({ id: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowIfEnterAEmptyParam('id', graphQLErrors);
    });

    it('should throw if not found appointment', async () => {
      const out = makeOut({ id: randId() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'O apontamento informado n??o existe!',
      });
    });

    it('should throw if enter a empty code', async () => {
      const out = makeOut({ id: appointment.id, code: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['code should not be empty'],
      });
    });

    it('should throw if enter a code that has already been registered', async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      const {
        data: {
          createAppointment: { code },
        },
      } = await api.mutation<{ createAppointment: Appointment }>(
        makeCreateAppointmentMutation(input),
      );

      const out = makeOut({ id: appointment.id, code });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Conflict',
        messages: 'Esse c??digo j?? foi utilizado!',
      });
    });

    it('should update appointment code', async () => {
      const { code } = makeFakeAppointment();

      const { data } = await makeOut({ id: appointment.id, code });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        code,
      });
    });

    it('should throw if enter a invalid date', async () => {
      const date = randFutureDate();

      const out = makeOut({ id: appointment.id, date });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          `The date must not go beyond today (${sub(today(), {
            hours: 3,
          }).toISOString()})`,
        ],
      });
    });

    it('should update appointment date', async () => {
      const { date } = makeFakeAppointment();

      const { data } = await makeOut({ id: appointment.id, date });

      date.setMilliseconds(0);

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        date: date.toISOString(),
      });
    });

    it('should throw if enter a actual time in startTime', async () => {
      const now = getNow();

      await makeOut({ id: appointment.id, date: now });

      const out = makeOut({
        id: appointment.id,
        startTime: format(now, 'HH:mm'),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio inicial precisa ser menor que o atual'],
      });
    });

    it('should throw if enter a startTime longer than endTime', async () => {
      const now = getNow();

      await makeOut({
        id: appointment.id,
        date: now,
      });

      await makeOut({
        id: appointment.id,
        endTime: format(sub(now, { minutes: 2 }), 'HH:mm'),
      });

      const out = makeOut({
        id: appointment.id,
        startTime: format(sub(now, { minutes: 1 }), 'HH:mm'),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio inicial precisa ser menor que o final'],
      });
    });

    it('should throw if enter a same time in startTime and endTime', async () => {
      const now = getNow();
      const time = format(sub(now, { minutes: 2 }), 'HH:mm');

      await makeOut({ id: appointment.id, date: now });

      await makeOut({ id: appointment.id, endTime: time });

      const out = makeOut({ id: appointment.id, startTime: time });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio inicial precisa ser menor que o final'],
      });
    });

    it('should throw if enter a endTime longer than actual', async () => {
      const now = getNow();

      await makeOut({
        id: appointment.id,
        date: now,
      });

      await makeOut({
        id: appointment.id,
        startTime: format(sub(now, { minutes: 3 }), 'HH:mm'),
      });

      const out = makeOut({
        id: appointment.id,
        endTime: format(add(now, { minutes: 2 }), 'HH:mm'),
      });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['O hor??rio final n??o deve ser maior que o atual'],
      });
    });

    it('should throw if enter a invalid startTime', async () => {
      const out = makeOut({ id: appointment.id, startTime: randWord() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'startTime must be a valid representation of military time in the format HH:MM',
        ],
      });
    });

    it('should update appointment startTime', async () => {
      const startTime = format(sub(getNow(), { minutes: 3 }), 'HH:mm');
      const endTime = format(getNow(), 'HH:mm');

      await makeOut({ id: appointment.id, endTime });

      const { data } = await makeOut({ id: appointment.id, startTime });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        endTime,
        startTime,
      });
    });

    it('should throw if enter a invalid endTime', async () => {
      const out = makeOut({ id: appointment.id, endTime: randWord() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: [
          'endTime must be a valid representation of military time in the format HH:MM',
        ],
      });
    });

    it('should update appointment endTime', async () => {
      const endTime = format(getNow(), 'HH:mm');

      const { data } = await makeOut({ id: appointment.id, endTime });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        endTime,
      });
    });

    it('should update appointment notMonetize', async () => {
      const notMonetize = !appointment.notMonetize;

      const { data } = await makeOut({ id: appointment.id, notMonetize });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        notMonetize,
      });
    });

    it('should throw if enter a invalid description', async () => {
      const out = makeOut({ id: appointment.id, description: '' });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['description should not be empty'],
      });
    });

    it('should update appointment description', async () => {
      const { description } = makeFakeAppointment();

      const { data } = await makeOut({ id: appointment.id, description });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        description,
      });
    });

    it('should update appointment commit', async () => {
      const { commit } = makeFakeAppointment();

      const { data } = await makeOut({ id: appointment.id, commit });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        commit,
      });
    });

    it('should update appointment status', async () => {
      const status =
        appointment.status === AppointmentStatus.Draft
          ? AppointmentStatus.Review
          : AppointmentStatus.Draft;

      const { data } = await makeOut({ id: appointment.id, status });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        status,
      });
    });

    // User
    it('should throw if enter a invalid userId', async () => {
      const out = makeOut({ id: appointment.id, userId: randId() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'O usu??rio informado n??o existe!',
      });
    });

    it('should update appointment user (with id)', async () => {
      const {
        data: { createUser },
      } = await api.mutation<{ createUser: User }>(
        makeCreateUserMutation(makeCreateUserInput()),
      );

      const { data } = await makeOut({
        id: appointment.id,
        userId: createUser.id,
      });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        user: { __typename: 'User', id: createUser.id },
      });
    });

    // Project
    it('should throw if enter a invalid projectId', async () => {
      const out = makeOut({ id: appointment.id, projectId: randId() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'O projeto informado n??o existe!',
      });
    });

    it('should update appointment project (with id)', async () => {
      const {
        data: { createClient },
      } = await api.mutation<{ createClient: Client }>(
        makeCreateClientMutation(makeCreateClientInput()),
      );

      const {
        data: { createProject },
      } = await api.mutation<{ createProject: Project }>(
        makeCreateProjectMutation({
          ...makeCreateProjectInput(),
          clientId: createClient.id,
        }),
      );

      delete createProject.categories;

      const { data } = await makeOut({
        id: appointment.id,
        projectId: createProject.id,
      });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        project: { __typename: 'Project', id: createProject.id },
      });
    });

    // Category
    it('should throw if enter a invalid categoryId', async () => {
      const out = makeOut({ id: appointment.id, categoryId: randId() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'A categoria informada n??o existe!',
      });
    });

    it('should update appointment category (with id)', async () => {
      const {
        data: { createCategory },
      } = await api.mutation<{ createCategory: Category }>(
        makeCreateCategoryMutation(makeCreateCategoryInput()),
      );

      const { data } = await makeOut({
        id: appointment.id,
        categoryId: createCategory.id,
      });

      expect(data).toHaveProperty('updateAppointment');

      expect(data.updateAppointment).toEqual({
        __typename: 'Appointment',
        ...appointment,
        category: { __typename: 'Category', id: createCategory.id },
      });
    });
  });

  describe('deleteAppointment', () => {
    let appointment: Appointment;

    const makeOut = async (input: Partial<DeleteAppointmentInput>) =>
      api.mutation<{ deleteAppointment: Appointment }>(
        makeDeleteAppointmentMutation(input),
      );

    beforeEach(async () => {
      const input = makeCreateAppointmentInput();

      input.userId = user.id;
      input.projectId = project.id;
      input.categoryId = category.id;

      const {
        data: { createAppointment },
      } = await api.mutation<{ createAppointment: Appointment }>(
        makeCreateAppointmentMutation(input),
      );

      appointment = createAppointment;
    });

    shouldThrowIfUnauthenticated('mutation', makeDeleteAppointmentMutation({}));

    it('should throw if no parameter as entered', async () => {
      const out = makeOut({});

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Bad Request',
        messages: ['Nenhum par??metro v??lido foi informado'],
      });
    });

    it('should delete by id', async () => {
      const { data } = await makeOut({ id: appointment.id });

      expect(data).toHaveProperty('deleteAppointment');
      expect(data.deleteAppointment).toBeTruthy();
    });

    it('should delete by code', async () => {
      const { data } = await makeOut({ code: appointment.code });

      expect(data).toHaveProperty('deleteAppointment');
      expect(data.deleteAppointment).toBeTruthy();
    });

    it('should throw if not found appointment', async () => {
      const out = makeOut({ code: randCode() });

      const { graphQLErrors } = await out.catch((e) => e);

      shouldThrowHelper({
        graphQLErrors,
        predictedError: 'Not Found',
        messages: 'O apontamento informado n??o existe!',
      });
    });
  });
});
