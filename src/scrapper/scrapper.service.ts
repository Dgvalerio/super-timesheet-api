import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import {
  AzureAppointment,
  SaveAppointmentOutput,
} from '@/scrapper/dto/save-appointment.output';
import { SaveAppointmentsParams } from '@/scrapper/dto/save-appointments.params';
import { SeedParams } from '@/scrapper/dto/seed.params';
import { UpdateParams } from '@/scrapper/dto/update.params';
import { VerifyAuthParams } from '@/scrapper/dto/verify-auth.params';

import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScrapperService {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
  ) {}

  async verifyAuth(input: VerifyAuthParams): Promise<boolean> {
    try {
      const token = await this.authService.jwtToken(input.user);

      const res = await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_API}/scrapper/auth-verify`, {
          login: input.login,
          password: input.password,
          token,
        }),
      );

      return res.data.authenticationIsValid;
    } catch (e) {
      return false;
    }
  }

  async seed(input: SeedParams): Promise<void> {
    try {
      const token = await this.authService.jwtToken(input.user);

      await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_API}/scrapper/seed`, {
          login: input.login,
          password: input.password,
          token,
        }),
      );
    } catch (e) {
      console.log(e);
    }
  }

  async update(input: UpdateParams): Promise<boolean> {
    try {
      const token = await this.authService.jwtToken(input.user);

      await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_API}/scrapper/seed`, {
          login: input.user.azureInfos.login,
          password: await decryptPassword({
            iv: input.user.azureInfos.iv,
            content: input.user.azureInfos.content,
          }),
          token,
        }),
      );

      return true;
    } catch (e) {
      console.log(e);

      return false;
    }
  }

  async saveAppointments(
    input: SaveAppointmentsParams,
  ): Promise<SaveAppointmentOutput[]> {
    try {
      const appointments: AzureAppointment[] = input.appointments.map((app) => {
        const obj = {
          id: app.id,
          client: app.project.client.code,
          project: app.project.code,
          category: app.category.code,
          description: app.description,
          date: format(app.date, 'ddMMyyyy'),
          notMonetize: app.notMonetize,
          startTime: app.startTime.replace(':', ''),
          endTime: app.endTime.replace(':', ''),
        };

        return app.commit ? { ...obj, commit: app.commit } : obj;
      });

      const { data } = await firstValueFrom(
        this.httpService.post<SaveAppointmentOutput[]>(
          `${process.env.AUTH_API}/scrapper/save-appointments`,
          {
            login: input.azureInfos.login,
            password: await decryptPassword({
              iv: input.azureInfos.iv,
              content: input.azureInfos.content,
            }),
            appointments,
          },
        ),
      );

      return data;
    } catch (e) {
      return (<AxiosError<SaveAppointmentOutput[]>>e).response.data;
    }
  }
}
