import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { ClientService } from '@/client/client.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import { Seed } from '@/scrapper/dto/seed.types';
import { User } from '@/user/user.entity';

import { AxiosRequestConfig } from 'axios';

// eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
export const errorLog = (...toLog: any) => console.error(...toLog);

@Injectable()
export class SeedService {
  request: AxiosRequestConfig;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private clientService: ClientService,
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

    if (clients.length <= 0) {
      errorLog('Clients not loaded');
    }

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

  async importUserData(user: User): Promise<string[]> {
    try {
      await this.loadCookies(user);

      const clients = await this.loadClients();

      if (clients.length <= 0) return [];

      await this.saveClients(clients);

      return ['clients'];
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
