import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import {
  Appointment,
  AppointmentStatus,
} from '@/appointment/appointment.entity';
import { AppointmentService } from '@/appointment/appointment.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import {
  checkValue,
  puppeteerOptions,
  scrapper,
  waitOptions,
} from '@/common/helpers/puppeteer';
import { CookieType } from '@/scrapper/auth-verify/dto/cookie.output';
import { AzureAppointment } from '@/scrapper/dto/save-appointment.output';
import { Seed } from '@/scrapper/dto/seed.types';
import { SaveAppointmentsUtilsTypes } from '@/scrapper/save-appointments/dto/save-appointments-utils.types';
import {
  SaveAppointmentsProgress,
  SaveAppointmentsStatus,
  WATCH_SAVE_APPOINTMENTS,
} from '@/scrapper/save-appointments/dto/save-appointments.output';
import { statusAdapter } from '@/scrapper/seed.service';
import { User } from '@/user/user.entity';

import { AxiosRequestConfig } from 'axios';
import { format, parseISO } from 'date-fns';
import { PubSub } from 'graphql-subscriptions';
import puppeteer, { Page } from 'puppeteer';
import { DeepPartial } from 'typeorm';
import Types = SaveAppointmentsUtilsTypes;

const conflictMessage =
  'O registro não pode ser realizado pois já existe um Apontamento dentro do intervalo de data e hora indicados';
const appointmentFailedMessage =
  'waiting for selector `.alert.alert-warning` failed: timeout 3000ms exceeded';

class SaveAppointmentsUtils implements Types.Interface {
  private request: AxiosRequestConfig;

  private page: Page;

  private appointments: Appointment[];

  constructor(
    private pubSub: PubSub,
    private appointmentService: AppointmentService,
    private httpService: HttpService,
    private userData: Types.UserData,
  ) {}

  progress: SaveAppointmentsProgress = {
    userId: ``,
    page: SaveAppointmentsStatus.Wait,
    loadAppointments: SaveAppointmentsStatus.Wait,
    auth: SaveAppointmentsStatus.Wait,
    saving: SaveAppointmentsStatus.Wait,
    saved: 0,
    updated: 0,
    appointment: {
      client: SaveAppointmentsStatus.Wait,
      project: SaveAppointmentsStatus.Wait,
      category: SaveAppointmentsStatus.Wait,
      description: SaveAppointmentsStatus.Wait,
      date: SaveAppointmentsStatus.Wait,
      commit: SaveAppointmentsStatus.Wait,
      notMonetize: SaveAppointmentsStatus.Wait,
      startTime: SaveAppointmentsStatus.Wait,
      endTime: SaveAppointmentsStatus.Wait,

      adapteToAzure: SaveAppointmentsStatus.Wait,
      page: SaveAppointmentsStatus.Wait,
      saveInAzure: SaveAppointmentsStatus.Wait,
      search: SaveAppointmentsStatus.Wait,
      getMoreData: SaveAppointmentsStatus.Wait,
      update: SaveAppointmentsStatus.Wait,
    },
  };

  setProgress(
    newProgress: DeepPartial<SaveAppointmentsProgress>,
  ): Promise<void> {
    this.progress = {
      ...this.progress,
      ...newProgress,
      appointment: { ...this.progress.appointment, ...newProgress.appointment },
    };

    return this.pubSub.publish(WATCH_SAVE_APPOINTMENTS, {
      [WATCH_SAVE_APPOINTMENTS]: this.progress,
    });
  }

  requestFactory(cookies: Seed.AuthVerify['cookies']): void {
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

  async loadPage(): Promise<void> {
    await this.setProgress({ page: SaveAppointmentsStatus.Load });

    const browser = await puppeteer.launch(puppeteerOptions);
    const context = await browser.createIncognitoBrowserContext();

    this.page = await context.newPage();

    await this.setProgress({ page: SaveAppointmentsStatus.Ok });
  }

  async loadAppointments(): Promise<void> {
    await this.setProgress({ loadAppointments: SaveAppointmentsStatus.Load });

    this.appointments = await this.appointmentService.getAllAppointments({
      user: { id: this.userData.id },
      status: AppointmentStatus.Draft,
    });

    await this.setProgress({ loadAppointments: SaveAppointmentsStatus.Ok });
  }

  async signIn(): Promise<CookieType[]> {
    await this.setProgress({ auth: SaveAppointmentsStatus.Load });

    await this.page.goto(scrapper.accountLogin);

    await this.page.waitForSelector('form');

    await this.page.type('#Login', this.userData.email);

    await this.page.type('#Password', this.userData.password);

    await this.page.click('[type="submit"]');

    await this.setProgress({ auth: SaveAppointmentsStatus.Process });

    await this.page.waitForSelector('.sidebar-menu', { timeout: 3000 });

    if (this.page.url() !== scrapper.homeIndex) {
      await this.setProgress({ auth: SaveAppointmentsStatus.Fail });

      return [];
    }

    const cookies = await this.page.cookies();

    if (!cookies) {
      await this.setProgress({ auth: SaveAppointmentsStatus.Fail });

      return [];
    }

    if (cookies.length <= 0) {
      await this.setProgress({ auth: SaveAppointmentsStatus.Fail });

      return [];
    }

    await this.setProgress({ auth: SaveAppointmentsStatus.Ok });

    this.requestFactory(cookies);

    return cookies;
  }

  async resetAppointmentProgress(): Promise<void> {
    const progress: Pick<SaveAppointmentsProgress, `appointment`> = {
      appointment: {
        client: SaveAppointmentsStatus.Wait,
        project: SaveAppointmentsStatus.Wait,
        category: SaveAppointmentsStatus.Wait,
        description: SaveAppointmentsStatus.Wait,
        date: SaveAppointmentsStatus.Wait,
        commit: SaveAppointmentsStatus.Wait,
        notMonetize: SaveAppointmentsStatus.Wait,
        startTime: SaveAppointmentsStatus.Wait,
        endTime: SaveAppointmentsStatus.Wait,

        adapteToAzure: SaveAppointmentsStatus.Wait,
        page: SaveAppointmentsStatus.Wait,
        saveInAzure: SaveAppointmentsStatus.Wait,
        search: SaveAppointmentsStatus.Wait,
        getMoreData: SaveAppointmentsStatus.Wait,
        update: SaveAppointmentsStatus.Wait,
      },
    };

    await this.setProgress(progress);
  }

  async adapteToAzure(appointment: Appointment): Promise<AzureAppointment> {
    await this.setProgress({
      appointment: { adapteToAzure: SaveAppointmentsStatus.Process },
    });

    const aux = {
      id: appointment.id,
      client: appointment.project.client.code,
      project: appointment.project.code,
      category: appointment.category.code,
      description: appointment.description,
      date: format(
        parseISO(appointment.date.toISOString().replace('Z', '')),
        'ddMMyyyy',
      ),
      notMonetize: appointment.notMonetize,
      startTime: appointment.startTime.replace(':', ''),
      endTime: appointment.endTime.replace(':', ''),
    };

    await this.setProgress({
      appointment: { adapteToAzure: SaveAppointmentsStatus.Ok },
    });

    return appointment.commit ? { ...aux, commit: appointment.commit } : aux;
  }

  async createAppointment(appointment: AzureAppointment): Promise<boolean> {
    try {
      await this.setProgress({
        appointment: { page: SaveAppointmentsStatus.Load },
      });

      await this.page.goto(scrapper.worksheetRead);

      await this.page.waitForSelector('#tbWorksheet', waitOptions);

      await this.setProgress({
        appointment: {
          page: SaveAppointmentsStatus.Ok,
          client: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.select('#IdCustomer', appointment.client);
      await this.page.waitForResponse((response) =>
        response.url().includes('/Worksheet/ReadProject'),
      );

      await this.setProgress({
        appointment: {
          client: SaveAppointmentsStatus.Ok,
          project: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.select('#IdProject', appointment.project);
      await this.page.waitForResponse((response) =>
        response.url().includes('/Worksheet/ReadCategory'),
      );
      await this.page.waitForResponse((response) =>
        response.url().includes('/Worksheet/ReadProjectProgress'),
      );

      await this.setProgress({
        appointment: {
          project: SaveAppointmentsStatus.Ok,
          category: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.select('#IdCategory', appointment.category);

      await this.setProgress({
        appointment: {
          category: SaveAppointmentsStatus.Ok,
          description: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.waitForSelector('#Description', waitOptions);
      await this.page.click('#Description');
      await this.page.keyboard.type(appointment.description);
      await checkValue(this.page, '#Description', appointment.description);

      await this.setProgress({
        appointment: {
          description: SaveAppointmentsStatus.Ok,
          date: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.waitForSelector('#InformedDate', waitOptions);
      await this.page.click('#InformedDate');
      await this.page.keyboard.type(appointment.date);
      await checkValue(this.page, '#InformedDate', appointment.date);

      await this.setProgress({
        appointment: {
          date: SaveAppointmentsStatus.Ok,
          commit: SaveAppointmentsStatus.Load,
        },
      });

      if (Number(appointment.category) === 1 && appointment.commit) {
        await this.page.waitForSelector('#CommitRepository', waitOptions);
        await this.page.click('#CommitRepository');
        await this.page.keyboard.type(appointment.commit);
        await checkValue(this.page, '#CommitRepository', appointment.commit);
      }

      await this.setProgress({
        appointment: {
          commit: SaveAppointmentsStatus.Ok,
          notMonetize: SaveAppointmentsStatus.Load,
        },
      });

      if (appointment.notMonetize) {
        await this.page.click('#NotMonetize');
        await checkValue(this.page, '#NotMonetize', appointment.notMonetize);
      }

      await this.setProgress({
        appointment: {
          notMonetize: SaveAppointmentsStatus.Ok,
          startTime: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.waitForSelector('#StartTime', waitOptions);
      await this.page.click('#StartTime');
      await this.page.keyboard.type(appointment.startTime);
      await checkValue(this.page, '#StartTime', appointment.startTime);

      await this.setProgress({
        appointment: {
          startTime: SaveAppointmentsStatus.Ok,
          endTime: SaveAppointmentsStatus.Load,
        },
      });

      await this.page.waitForSelector('#EndTime', waitOptions);
      await this.page.click('#EndTime');
      await this.page.keyboard.type(appointment.endTime);
      await checkValue(this.page, '#EndTime', appointment.endTime);

      await this.setProgress({
        appointment: { endTime: SaveAppointmentsStatus.Ok },
      });

      await this.page.click('[type="submit"]');
      await this.page.waitForSelector('.alert.alert-warning', waitOptions);

      await this.setProgress({
        appointment: { saveInAzure: SaveAppointmentsStatus.Ok },
        saved: this.progress.saved + 1,
      });

      return true;
    } catch (e) {
      await this.setProgress({
        appointment: {
          client: SaveAppointmentsStatus.Fail,
          project: SaveAppointmentsStatus.Fail,
          category: SaveAppointmentsStatus.Fail,
          description: SaveAppointmentsStatus.Fail,
          date: SaveAppointmentsStatus.Fail,
          commit: SaveAppointmentsStatus.Fail,
          notMonetize: SaveAppointmentsStatus.Fail,
          startTime: SaveAppointmentsStatus.Fail,
          endTime: SaveAppointmentsStatus.Fail,

          saveInAzure: SaveAppointmentsStatus.Fail,
        },
      });

      let failMessage = (<Error>e).message;

      if ((<Error>e).message === appointmentFailedMessage) {
        try {
          await this.page.waitForSelector('.alert.alert-danger', waitOptions);

          const response = await this.page.evaluate(
            () => document.querySelector('.alert.alert-danger')?.textContent,
          );

          if (response) failMessage = response.replace(/\n\s+/gm, '');
        } catch (e2) {}
      }

      await this.setProgress({ appointment: { failMessage } });

      return false;
    }
  }

  async searchInAppointments(
    search: AzureAppointment,
  ): Promise<Types.SearchOutput | undefined> {
    await this.setProgress({
      appointment: { search: SaveAppointmentsStatus.Process },
    });

    try {
      await this.page.goto(scrapper.worksheetRead);

      await this.page.waitForSelector('#tbWorksheet', waitOptions);

      const dataFromRow: Types.GetDataFromRow | undefined =
        await this.page.evaluate(
          (date, startTime, endTime) => {
            let item: Types.GetDataFromRow | undefined;

            const getDataFromRow = (item: Element): Types.GetDataFromRow => {
              const getInnerText = (field: unknown) =>
                (field as HTMLTableColElement)?.innerText;

              const getId = (field: unknown) =>
                (field as HTMLTableColElement)?.children[0].id;

              return {
                code: getId(item.children[9]),
                date: getInnerText(item.children[3]),
                startTime: getInnerText(item.children[4]),
                endTime: getInnerText(item.children[5]),
                status: getInnerText(item.children[8]),
              };
            };

            document
              .querySelectorAll('#tbWorksheet > tbody > tr')
              .forEach((row) => {
                const fromRow = getDataFromRow(row);

                if (
                  fromRow.date.replace(/\//g, '') === date &&
                  fromRow.startTime.replace(/:/g, '') === startTime &&
                  fromRow.endTime.replace(/:/g, '') === endTime
                )
                  item = fromRow;
              });

            return item;
          },
          search.date,
          search.startTime,
          search.endTime,
        );

      await this.setProgress({
        appointment: { search: SaveAppointmentsStatus.Ok },
      });

      if (!dataFromRow) return;

      await this.setProgress({
        appointment: { getMoreData: SaveAppointmentsStatus.Load },
      });

      const dataFromHttp = await this.httpService.axiosRef.get<{
        IdCustomer: number;
        IdProject: number;
        IdCategory: number;
        Description: string;
        Commit: string;
        NotMonetize: boolean;
      }>(`/Worksheet/Update?id=${dataFromRow.code}`, { ...this.request });

      await this.setProgress({
        appointment: { getMoreData: SaveAppointmentsStatus.Ok },
      });

      if (!dataFromHttp) return;

      return {
        id: search.id,
        code: dataFromRow.code,
        commit: dataFromHttp.data.Commit,
        status: statusAdapter(dataFromRow.status),
        date: dataFromRow.date,
        startTime: dataFromRow.startTime,
        endTime: dataFromRow.endTime,
        notMonetize: dataFromHttp.data.NotMonetize,
        category: String(dataFromHttp.data.IdCategory),
        project: String(dataFromHttp.data.IdProject),
        client: String(dataFromHttp.data.IdCustomer),
        description: dataFromHttp.data.Description,
      };
    } catch (e) {
      await this.setProgress({
        appointment: {
          search: SaveAppointmentsStatus.Fail,
          getMoreData: SaveAppointmentsStatus.Fail,
        },
      });

      return;
    }
  }

  descriptionAdapter(description: string): string {
    return description.replace(/[\r\n]+/gm, '');
  }

  compareAppointments(
    searchResult: Types.SearchOutput,
    toSave: AzureAppointment,
  ): boolean {
    return (
      JSON.stringify({
        client: toSave.client,
        project: toSave.project,
        category: toSave.category,
        description: this.descriptionAdapter(toSave.description),
        date: toSave.date,
        commit: toSave.commit,
        notMonetize: toSave.notMonetize,
        startTime: toSave.startTime,
        endTime: toSave.endTime,
      }) ===
      JSON.stringify({
        client: searchResult.client,
        project: searchResult.project,
        category: searchResult.category,
        description: this.descriptionAdapter(searchResult.description),
        date: searchResult.date.replace(/\//g, ''),
        commit:
          searchResult.commit === 'Não aplicado'
            ? undefined
            : searchResult.commit,
        notMonetize: searchResult.notMonetize,
        startTime: searchResult.startTime.replace(/:/g, ''),
        endTime: searchResult.endTime.replace(/:/g, ''),
      })
    );
  }

  async processAppointments(): Promise<void> {
    const update = async (appointment: Types.UpdateInput) => {
      await this.setProgress({
        appointment: { update: SaveAppointmentsStatus.Load },
      });

      await this.appointmentService.updateAppointment({
        id: appointment.id,
        code: appointment.code,
        status: appointment.status,
        commit: appointment.commit,
      });

      await this.setProgress({
        appointment: { update: SaveAppointmentsStatus.Ok },
        updated: this.progress.updated + 1,
      });
    };

    const create = async (index: number) => {
      await this.resetAppointmentProgress();

      const appointment = await this.adapteToAzure(this.appointments[index]);

      const created = await this.createAppointment(appointment);

      const isConflict =
        !created && this.progress.appointment.failMessage === conflictMessage;

      if (created || isConflict) {
        const searchOutput = await this.searchInAppointments(appointment);

        if (searchOutput) {
          if (
            isConflict &&
            !this.compareAppointments(searchOutput, appointment)
          )
            return;

          await update(searchOutput);
        }
      }

      if (!created || index >= this.appointments.length - 1) return;

      await create(index + 1);
    };

    await create(0);
  }

  async run(): Promise<void> {
    await this.setProgress({ userId: this.userData.id });

    await this.loadPage();

    await this.loadAppointments();

    if (this.appointments.length <= 0) return;

    await this.signIn();

    await this.processAppointments();
  }
}

@Injectable()
export class SaveAppointmentsService {
  constructor(
    private pubSub: PubSub,
    private appointmentService: AppointmentService,
    private httpService: HttpService,
  ) {}

  async saveAppointments(user: User): Promise<boolean> {
    try {
      const utils = new SaveAppointmentsUtils(
        this.pubSub,
        this.appointmentService,
        this.httpService,
        {
          id: user.id,
          email: user.azureInfos.login,
          password: await decryptPassword({
            iv: user.azureInfos.iv,
            content: user.azureInfos.content,
          }),
        },
      );

      await utils.run();

      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Save Appointments failure: ', { e });

      return false;
    }
  }
}
