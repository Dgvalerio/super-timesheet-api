import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { CategoryService } from '@/category/category.service';
import { ClientService } from '@/client/client.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import { brDateToISO } from '@/common/helpers/today';
import { ProjectService } from '@/project/project.service';
import { Seed } from '@/scrapper/dto/seed.types';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { AxiosRequestConfig } from 'axios';

// eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
export const errorLog = (...toLog: any) => console.error(...toLog);

@Injectable()
export class SeedService {
  request: AxiosRequestConfig;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private userService: UserService,
    private clientService: ClientService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
  ) {}

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
    const token = await this.authService.jwtToken(user);

    if (!user.azureInfos)
      throw new NotFoundException('Nenhuma informação da azure foi encontrada');

    const password = await decryptPassword({
      iv: user.azureInfos.iv,
      content: user.azureInfos.content,
    });

    const res = await this.httpService.axiosRef.post<Seed.AuthVerify>(
      `${process.env.AUTH_API}/scrapper/auth-verify`,
      {
        login: user.azureInfos.login,
        password,
        token,
      },
    );

    this.requestFactory(res.data.cookies);
  }

  // Clients
  async loadClients(): Promise<Seed.Client[]> {
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
  }

  // Projects
  async loadProjects(clients: Seed.Client[]): Promise<Seed.Project[]> {
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
  }

  // Categories
  async loadCategories(projects: Seed.Project[]): Promise<Seed.Category[]> {
    let categories: Seed.Category[] = [];

    const getProjectCategories = async (index: number) => {
      try {
        const { data } = await this.httpService.axiosRef.post<Seed.Category[]>(
          '/Worksheet/ReadCategory',
          `idproject=${projects[index].Id}`,
          { ...this.request },
        );

        categories = categories.concat(data);
      } catch (e) {
        errorLog(`Error on "Get Categories [${index}]" process!`, e);
      }

      if (index < projects.length - 1) await getProjectCategories(index + 1);
    };

    await getProjectCategories(0);

    if (categories.length <= 0) errorLog('Categories not loaded');

    return categories;
  }

  async saveCategories(categories: Seed.Category[]): Promise<void> {
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
  }

  async importUserData(user: User): Promise<string[]> {
    try {
      await this.loadCookies(user);

      // Clients
      console.time('clients');

      console.time('loadClients');

      const clients = await this.loadClients();

      console.timeEnd('loadClients');

      if (clients.length <= 0) return [];

      console.time('saveClients');

      await this.saveClients(clients);

      console.timeEnd('saveClients');

      console.timeEnd('clients');

      // Projects
      console.time('projects');

      console.time('loadProjects');

      const projects = await this.loadProjects(clients);

      console.timeEnd('loadProjects');

      if (projects.length <= 0) return ['clients'];

      console.time('saveProjects');

      await this.saveProjects(user.id, projects);

      console.timeEnd('saveProjects');

      console.timeEnd('projects');

      // Categories
      console.time('categories');

      console.time('loadCategories');

      const categories = await this.loadCategories(projects);

      console.timeEnd('loadCategories');

      if (categories.length <= 0) return ['clients', 'projects'];

      console.time('saveCategories');

      await this.saveCategories(categories);

      console.timeEnd('saveCategories');

      console.timeEnd('categories');

      return ['clients', 'projects', 'categories'];
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
