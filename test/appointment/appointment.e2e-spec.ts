import { makeCreateAppointmentInput } from '!/appointment/collaborators/makeCreateAppointmentInput';
import { makeCreateAppointmentMutation } from '!/appointment/collaborators/makeCreateAppointmentMutation';
import { makeDeleteAppointmentMutation } from '!/appointment/collaborators/makeDeleteAppointmentMutation';
import { makeGetAllAppointmentsQuery } from '!/appointment/collaborators/makeGetAllAppointmentsQuery';
import { makeGetAppointmentQuery } from '!/appointment/collaborators/makeGetAppointmentQuery';
import { makeUpdateAppointmentMutation } from '!/appointment/collaborators/makeUpdateAppointmentMutation';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import { shouldThrowIfUnauthenticated } from '!/collaborators/helpers';

describe('Graphql Appointment Module (e2e)', () => {
  const api = new ApolloClientHelper();

  beforeAll(async () => {
    await api.authenticate();
  });

  describe('createAppointment', () => {
    shouldThrowIfUnauthenticated(
      'mutation',
      makeCreateAppointmentMutation(makeCreateAppointmentInput()),
    );
  });

  describe('getAllAppointments', () => {
    shouldThrowIfUnauthenticated('query', makeGetAllAppointmentsQuery());
  });

  describe('getAppointment', () => {
    shouldThrowIfUnauthenticated('mutation', makeGetAppointmentQuery({}));
  });

  describe('updateAppointment', () => {
    shouldThrowIfUnauthenticated('mutation', makeUpdateAppointmentMutation({}));
  });

  describe('deleteAppointment', () => {
    shouldThrowIfUnauthenticated('mutation', makeDeleteAppointmentMutation({}));
  });
});
