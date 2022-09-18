/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';

import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { AppointmentService } from '@/appointment/appointment.service';
import { CategoryService } from '@/category/category.service';
import { ClientService } from '@/client/client.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import { brDateToISO } from '@/common/helpers/today';
import { ProjectService } from '@/project/project.service';
import { AuthVerifyService } from '@/scrapper/auth-verify/auth-verify.service';
import {
  SeedOutput,
  SeedStatus,
  WATCH_IMPORT_DATA,
} from '@/scrapper/dto/seed.output';
import { Seed } from '@/scrapper/dto/seed.types';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { AxiosRequestConfig } from 'axios';
import { PubSub } from 'graphql-subscriptions';

export const errorLog = (...toLog: any) => console.error(...toLog);

export const statusAdapter = (previous: string): AppointmentStatus => {
  switch (previous) {
    case 'Aprovada':
      return AppointmentStatus.Approved;
    case 'Pré-Aprovada':
      return AppointmentStatus.PreApproved;
    case 'Em análise':
      return AppointmentStatus.Review;
    case 'Reprovada':
      return AppointmentStatus.Unapproved;
    default:
      return AppointmentStatus.Unknown;
  }
};

class ImportUserDataUtils {
  request: AxiosRequestConfig;

  constructor(
    private authVerifyService: AuthVerifyService,
    private httpService: HttpService,
    private userService: UserService,
    private clientService: ClientService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private appointmentService: AppointmentService,
    private pubSub: PubSub,
  ) {
    this.pubSub = pubSub;
  }

  progress: SeedOutput = {
    userId: '',
    login: SeedStatus.Wait,
    clients: SeedStatus.Wait,
    projects: SeedStatus.Wait,
    categories: SeedStatus.Wait,
    appointments: SeedStatus.Wait,
  };

  setProgress(newProgress: Partial<SeedOutput>) {
    this.progress = { ...this.progress, ...newProgress };

    return this.pubSub.publish(WATCH_IMPORT_DATA, {
      [WATCH_IMPORT_DATA]: this.progress,
    });
  }

  requestFactory(cookies: Seed.AuthVerify['cookies']) {
    const cookie: string = cookies.reduce(
      (previous, { name, value }) => `${previous} ${name}=${value};`,
      '',
    );

    this.request = {
      baseURL: 'https://luby-timesheet.azurewebsites.net',
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-requested-with': 'XMLHttpRequest',
        cookie,
        Referer: 'https://luby-timesheet.azurewebsites.net/Worksheet/Read',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    };
  }

  async loadCookies(user: User): Promise<void> {
    await this.setProgress({ login: SeedStatus.Load });

    if (!user.azureInfos)
      throw new NotFoundException('Nenhuma informação da azure foi encontrada');

    const password = await decryptPassword({
      iv: user.azureInfos.iv,
      content: user.azureInfos.content,
    });

    const cookies = await this.authVerifyService.authVerify({
      login: user.azureInfos.login,
      password,
    });

    this.requestFactory(cookies);

    await this.setProgress({ login: SeedStatus.Ok });
  }

  // Clients
  async loadClients(): Promise<Seed.Client[]> {
    await this.setProgress({ clients: SeedStatus.Load });

    const clients: Seed.Client[] = [];

    try {
      const response = await this.httpService.axiosRef.get('/Worksheet/Read', {
        ...this.request,
      });

      const html: string = response.data;

      const regex = /(name="IdCustomer">)([\w\W]+?)(<\/select>)/gm;

      const search: string = (html.match(regex) || [''])[0];

      const cleanedSearch = search.split(/\r\n/gm).join('');

      const values = cleanedSearch.match(/value="([\S\s]+?)??">([\S\s]+?)</g);

      if (!values) {
        if (html.match('<div class="login-content">'))
          errorLog('Cookies are invalid!');
        else errorLog('Options not found!');

        return [];
      }

      const clientsPromise: Promise<Seed.Client>[] = values.map(
        async (option) => {
          const [id, title] = option
            .replace(/value="([\S\s]+?)??">([\S\s]+?)</g, '$1|$2')
            .split('|');

          if (id) clients.push({ id, title });

          return { id: id || '-1', title };
        },
      );

      await Promise.all(clientsPromise);
    } catch (e) {
      errorLog('Error on "Get Clients" process!', e);
    }

    if (clients.length <= 0) errorLog('Clients not loaded');

    return clients;
  }

  async saveClients(clients: Seed.Client[]): Promise<void> {
    await this.setProgress({ clients: SeedStatus.Save });

    const saveClient = async (index: number) => {
      const { id, title } = clients[index];

      try {
        const client = await this.clientService.getClient({ code: id });

        if (!client)
          await this.clientService.createClient({ code: id, name: title });
      } catch (e) {
        errorLog(`Erro on save client ${index + 1} of ${clients.length}: ${e}`);
      }

      if (index < clients.length - 1) await saveClient(index + 1);
    };

    await saveClient(0);

    await this.setProgress({ clients: SeedStatus.Ok });
  }

  // Projects
  async loadProjects(clients: Seed.Client[]): Promise<Seed.Project[]> {
    await this.setProgress({ projects: SeedStatus.Load });

    const mapPromise = clients.map(async ({ id }) => {
      try {
        const { data } = await this.httpService.axiosRef.post<
          Omit<Seed.Project, 'progress'>[]
        >('/Worksheet/ReadProject', `idcustomer=${id}`, { ...this.request });

        return data;
      } catch (e) {
        errorLog(`Error on "Get Projects [${id}]" process!`, e);

        return [];
      }
    });

    const mappedProjects = await Promise.all(mapPromise);
    const projects: Seed.Project[] = mappedProjects.reduce((prev, current) =>
      prev.concat(current),
    );

    if (projects.length <= 0) errorLog('Projects not loaded');

    return projects;
  }

  async saveProjects(userId: string, projects: Seed.Project[]): Promise<void> {
    await this.setProgress({ projects: SeedStatus.Save });

    const saveProject = async (index: number) => {
      const { Id, Name, EndDate, StartDate, IdCustomer } = projects[index];

      try {
        const project = await this.projectService.getProject({
          code: String(Id),
        });

        if (!project)
          await this.projectService.createProject({
            code: String(Id),
            name: Name,
            startDate: new Date(brDateToISO(StartDate)),
            endDate: new Date(brDateToISO(EndDate)),
            clientCode: String(IdCustomer),
          });
      } catch (e) {
        errorLog(
          `Error on save project ${index + 1} of ${projects.length}: ${e}`,
        );
      }

      try {
        const { projects } = await this.userService.getUser({ id: userId });

        const inProjects = projects.find(({ code }) => code === String(Id));

        if (!inProjects) {
          const project = await this.projectService.getProject({
            code: String(Id),
          });

          if (project)
            await this.projectService.addProjectToUser({
              userId,
              projectId: project.id,
            });
        }
      } catch (e) {
        errorLog(
          `Error on add project ${index + 1} of ${
            projects.length
          } to user: ${e}`,
        );
      }

      if (index < projects.length - 1) await saveProject(index + 1);
    };

    await saveProject(0);

    await this.setProgress({ projects: SeedStatus.Ok });
  }

  // Categories
  async loadCategories(projects: Seed.Project[]): Promise<Seed.Category[]> {
    await this.setProgress({ categories: SeedStatus.Load });

    const mapPromise = projects.map(async ({ Id }) => {
      try {
        const { data } = await this.httpService.axiosRef.post<Seed.Category[]>(
          '/Worksheet/ReadCategory',
          `idproject=${Id}`,
          { ...this.request },
        );

        return data;
      } catch (e) {
        errorLog(`Error on "Get Categories [${Id}]" process!`, e);

        return [];
      }
    });

    const mappedCategories = await Promise.all(mapPromise);
    const categories: Seed.Category[] = mappedCategories.reduce(
      (prev, current) => prev.concat(current),
    );

    if (categories.length <= 0) errorLog('Categories not loaded');

    return categories;
  }

  async saveCategories(categories: Seed.Category[]): Promise<void> {
    await this.setProgress({ categories: SeedStatus.Save });

    const saveCategory = async (index: number) => {
      const { Id, Name, IdProject } = categories[index];

      try {
        const category = await this.categoryService.getCategory({
          code: String(Id),
        });

        if (!category)
          await this.categoryService.createCategory({
            code: String(Id),
            name: Name,
          });
      } catch (e) {
        errorLog(
          `Error on save category ${index + 1} of ${categories.length}: ${e}`,
        );
      }

      try {
        const project = await this.projectService.getProject({
          code: String(IdProject),
        });

        const inCategories = project.categories.find(
          ({ code }) => code === String(Id),
        );

        if (!inCategories) {
          const category = await this.categoryService.getCategory({
            code: String(Id),
          });

          if (category)
            await this.projectService.addCategory({
              categoryId: category.id,
              projectId: project.id,
            });
        }
      } catch (e) {
        errorLog(
          `Error on add category ${index + 1} of ${
            categories.length
          } to project: ${e}`,
        );
      }

      if (index < categories.length - 1) await saveCategory(index + 1);
    };

    await saveCategory(0);

    await this.setProgress({ categories: SeedStatus.Ok });
  }

  // Appointments
  async loadAppointments(): Promise<Seed.ToCreateAppointment[]> {
    await this.setProgress({ appointments: SeedStatus.Load });

    let appointments: Seed.ToCreateAppointment[] = [];

    try {
      const response = await this.httpService.axiosRef.get('/Worksheet/Read', {
        ...this.request,
      });

      const html: string = response.data;

      const regex = /(<tbody>)([\w\W]+?)(<\/tbody>)/gm;

      const search: string = (html.match(regex) || [''])[0];

      const cleanedSearch = search.split(/\r\n/gm).join('');

      const rows = cleanedSearch.match(/tr>([\S\s]+?)<\/tr/g);

      if (!rows) {
        if (html.match('<div class="login-content">'))
          errorLog(`[${401}]: Cookies are invalid!`);
        else errorLog(`[${500}]: Options not found!`);

        return [];
      }

      const appointmentsPromise = rows.map(
        async (row): Promise<Seed.ToCreateAppointment> => {
          const cols = row.split(/<\/td>([\S\s]+?)<td>/gm);

          cols[0] = cols[0].replace(/tr>([\S\s]+?)<td>/gm, '');

          cols[16] = (cols[16].match(/fff">([\S\s]+?)<\/span/gm) || [''])[0];
          cols[16] = cols[16].replace(/fff">([\S\s]+?)<\/span/gm, '$1');

          cols[18] = (cols[18].match(/id="([\S\s]+?)"/gm) || [''])[0];
          cols[18] = cols[18].replace(/id="([\S\s]+?)"/gm, '$1');

          const partial = { code: cols[18], status: statusAdapter(cols[16]) };

          const {
            data: {
              IdProject,
              IdCategory,
              InformedDate,
              StartTime,
              EndTime,
              NotMonetize,
              Description,
              CommitRepository,
            },
          } = await this.httpService.axiosRef.get<Seed.FullAppointment>(
            `/Worksheet/Update?id=${partial.code}`,
            { ...this.request },
          );

          return {
            code: partial.code,
            projectCode: String(IdProject),
            categoryCode: String(IdCategory),
            date: new Date(brDateToISO(InformedDate)),
            startTime: StartTime,
            endTime: EndTime,
            description: Description,
            notMonetize: NotMonetize,
            status: partial.status,
            commit: CommitRepository || '',
          };
        },
      );

      appointments = await Promise.all(appointmentsPromise);
    } catch (e) {
      errorLog('Error on "Get Appointments" process!', e);
    }

    if (appointments.length <= 0) errorLog('Appointments not loaded');

    return appointments;
  }

  descriptionAdapter = (description: string) =>
    description.replace(/[\r\n]+/gm, '');

  async compareAndUpdateAppointment(
    toSave: Seed.ToCreateAppointment,
    saved: Appointment,
  ): Promise<void> {
    if (toSave.date.toISOString() === saved.date.toISOString()) {
      console.log('O dia bate!');
      if (toSave.startTime === saved.startTime) {
        console.log('O horário inicial bate!');
        if (toSave.endTime === saved.endTime) {
          console.log('O horário final bate!');
          if (
            this.descriptionAdapter(toSave.description) ===
            this.descriptionAdapter(saved.description)
          ) {
            console.log('Até a descrição bate!');
            if (toSave.notMonetize === saved.notMonetize) {
              console.log('A monetização também bate!');
              if (
                (toSave.commit === 'Não aplicado' ? null : toSave.commit) ===
                saved.commit
              ) {
                console.log(
                  'Mano, o commit bate, é o mesmo apontamento, vou atualizar',
                );

                try {
                  await this.appointmentService.updateAppointment({
                    id: saved.id,
                    ...toSave,
                  });
                } catch (e) {
                  errorLog(`Error on compareAndUpdateAppointment: ${e}`);
                }
              } else console.log('Mano, o commit não bate');
            } else console.log('A monetização não bate!');
          } else console.log('Mas a descrição não bate!');
        } else console.log('O horário final não bate!');
      } else console.log('O horário inicial não bate!');
    } else console.log('O dia não bate!');
  }

  async saveAppointments(
    appointments: Seed.ToCreateAppointment[],
    userId: string,
  ): Promise<void> {
    await this.setProgress({ appointments: SeedStatus.Save });

    const saveAppointment = async (index: number) => {
      try {
        const appointment = await this.appointmentService.getAppointment({
          code: appointments[index].code,
        });

        if (appointment) {
          await this.appointmentService.updateAppointment({
            id: appointment.id,
            ...appointments[index],
          });
        } else {
          await this.appointmentService.createAppointment({
            ...appointments[index],
            userId,
          });
        }
      } catch (e) {
        if (e.response.description) {
          const {
            response: { description, timeConflict },
          } = <
            { response: { description: string; timeConflict: Appointment } }
          >e;

          errorLog(
            `Error on create appointment ${index + 1} of ${
              appointments.length
            }: ${description}`,
          );

          await this.compareAndUpdateAppointment(
            appointments[index],
            timeConflict,
          );
        } else {
          errorLog(
            `Error on create appointment ${index + 1} of ${
              appointments.length
            }: ${e}`,
            e,
          );
        }
      }

      if (index < appointments.length - 1) await saveAppointment(index + 1);
    };

    await saveAppointment(0);

    await this.setProgress({ appointments: SeedStatus.Ok });
  }
}

@Injectable()
export class SeedService {
  constructor(
    private authVerifyService: AuthVerifyService,
    private httpService: HttpService,
    private userService: UserService,
    private clientService: ClientService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private appointmentService: AppointmentService,
    private pubSub: PubSub,
  ) {}

  async importUserData(user: User): Promise<void> {
    const dataUtils = new ImportUserDataUtils(
      this.authVerifyService,
      this.httpService,
      this.userService,
      this.clientService,
      this.projectService,
      this.categoryService,
      this.appointmentService,
      this.pubSub,
    );

    await dataUtils.setProgress({ userId: user.id });

    try {
      await dataUtils.loadCookies(user);

      // Clients
      const clients = await dataUtils.loadClients();

      if (clients.length <= 0)
        return await dataUtils.setProgress({
          clients: SeedStatus.Fail,
          projects: SeedStatus.Fail,
          categories: SeedStatus.Fail,
          appointments: SeedStatus.Fail,
        });

      await dataUtils.saveClients(clients);

      // Projects
      const projects = await dataUtils.loadProjects(clients);

      if (projects.length <= 0)
        return await dataUtils.setProgress({
          projects: SeedStatus.Fail,
          categories: SeedStatus.Fail,
          appointments: SeedStatus.Fail,
        });

      await dataUtils.saveProjects(user.id, projects);

      // Categories
      const categories = await dataUtils.loadCategories(projects);

      if (categories.length <= 0)
        return await dataUtils.setProgress({
          categories: SeedStatus.Fail,
          appointments: SeedStatus.Fail,
        });

      await dataUtils.saveCategories(categories);

      // Categories;
      const appointments = await dataUtils.loadAppointments();

      if (appointments.length <= 0)
        return await dataUtils.setProgress({
          appointments: SeedStatus.Fail,
        });

      await dataUtils.saveAppointments(appointments, user.id);
    } catch (e) {
      errorLog({
        message: e.message,
        code: e.code,
        response: {
          status: e.response?.status,
          statusText: e.response?.statusText,
          data: e.response?.data,
        },
      });

      return e;
    }
  }
}
