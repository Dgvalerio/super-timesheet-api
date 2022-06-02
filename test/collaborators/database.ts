import { Appointment } from '@/appointment/appointment.entity';
import { Category } from '@/category/category.entity';
import { Client } from '@/client/client.entity';
import { Project } from '@/project/project.entity';
import { User } from '@/user/user.entity';

import { makeDeleteAppointmentMutation } from '!/appointment/collaborators/makeDeleteAppointmentMutation';
import { makeGetAllAppointmentsQuery } from '!/appointment/collaborators/makeGetAllAppointmentsQuery';
import { makeDeleteCategoryMutation } from '!/category/collaborators/makeDeleteCategoryMutation';
import { makeGetAllCategoriesQuery } from '!/category/collaborators/makeGetAllCategoriesQuery';
import { makeDeleteClientMutation } from '!/client/collaborators/makeDeleteClientMutation';
import { makeGetAllClientsQuery } from '!/client/collaborators/makeGetAllClientsQuery';
import { ApolloClientHelper } from '!/collaborators/apolloClient';
import { makeDeleteProjectMutation } from '!/project/collaborators/makeDeleteProjectMutation';
import { makeGetAllProjectsQuery } from '!/project/collaborators/makeGetAllProjectsQuery';
import { makeDeleteUserMutation } from '!/user/collaborators/makeDeleteUserMutation';
import { makeGetAllUsersQuery } from '!/user/collaborators/makeGetAllUsersQuery';

export const clearAppointments = async (
  api: ApolloClientHelper,
): Promise<void> => {
  const {
    data: { getAllAppointments },
  } = await api.query<{ getAllAppointments: Appointment[] }>(
    makeGetAllAppointmentsQuery(),
  );

  if (getAllAppointments.length === 0) return;

  const promise = getAllAppointments.map(async ({ id }) => {
    return await api.mutation<{ deleteAppointment: Appointment }>(
      makeDeleteAppointmentMutation({ id }),
    );
  });

  await Promise.all(promise);
};

export const clearCategories = async (
  api: ApolloClientHelper,
): Promise<void> => {
  const {
    data: { getAllCategories },
  } = await api.query<{ getAllCategories: Category[] }>(
    makeGetAllCategoriesQuery(),
  );

  if (getAllCategories.length === 0) return;

  const promise = getAllCategories.map(async ({ id }) => {
    return await api.mutation<{ deleteCategory: Category }>(
      makeDeleteCategoryMutation({ id }),
    );
  });

  await Promise.all(promise);
};

export const clearClients = async (api: ApolloClientHelper): Promise<void> => {
  const {
    data: { getAllClients },
  } = await api.query<{ getAllClients: Client[] }>(makeGetAllClientsQuery());

  if (getAllClients.length === 0) return;

  const promise = getAllClients.map(async ({ id }) => {
    return await api.mutation<{ deleteClient: Client }>(
      makeDeleteClientMutation({ id }),
    );
  });

  await Promise.all(promise);
};

export const clearProjects = async (api: ApolloClientHelper): Promise<void> => {
  const {
    data: { getAllProjects },
  } = await api.query<{ getAllProjects: Project[] }>(makeGetAllProjectsQuery());

  if (getAllProjects.length === 0) return;

  const promise = getAllProjects.map(async ({ id }) => {
    return await api.mutation<{ deleteProject: Project }>(
      makeDeleteProjectMutation({ id }),
    );
  });

  await Promise.all(promise);
};

export const clearUsers = async (api: ApolloClientHelper): Promise<void> => {
  const {
    data: { getAllUsers },
  } = await api.query<{ getAllUsers: User[] }>(makeGetAllUsersQuery());

  if (getAllUsers.length === 0) return;

  const promise = getAllUsers.map(async ({ id }) => {
    return await api.mutation<{ deleteUser: boolean }>(
      makeDeleteUserMutation({ id }),
    );
  });

  await Promise.all(promise);
};

export const clearDatabase = async (api: ApolloClientHelper): Promise<void> => {
  await clearAppointments(api);
  await clearCategories(api);
  await clearProjects(api);
  await clearClients(api);
  await clearUsers(api);
};
