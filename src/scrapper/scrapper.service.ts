import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AppointmentStatus } from '@/appointment/appointment.entity';
import { AppointmentService } from '@/appointment/appointment.service';
import { AuthService } from '@/auth/auth.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import {
  AzureAppointment,
  SaveAppointmentOutput,
} from '@/scrapper/dto/save-appointment.output';
import { SaveAppointmentsParams } from '@/scrapper/dto/save-appointments.params';
import { UpdateParams } from '@/scrapper/dto/update.params';
import { User } from '@/user/user.entity';

import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScrapperService {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
  ) {}

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
      // eslint-disable-next-line no-console
      console.log(e);

      return false;
    }
  }

  async sendAppointments(user: User): Promise<SaveAppointmentOutput[]> {
    const appointments = await this.appointmentService.getAllAppointments({
      user: { id: user.id },
      status: AppointmentStatus.Draft,
    });

    if (appointments.length <= 0) return [];

    const saveAppointmentOutputs = await this.saveAppointments({
      azureInfos: user.azureInfos,
      appointments,
    });

    if (saveAppointmentOutputs.length <= 0) return saveAppointmentOutputs;

    const promise = saveAppointmentOutputs.map(async (output) => {
      const { appointment } = output;

      const updated = await this.appointmentService.updateAppointment({
        id: appointment.id,
        code: appointment.code,
        status: appointment.status,
        commit: appointment.commit,
      });

      return { ...output, appointment: updated };
    });

    return await Promise.all(promise);
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
