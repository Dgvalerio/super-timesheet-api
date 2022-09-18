import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AppointmentService } from '@/appointment/appointment.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import SaveAppointmentsUtils from '@/scrapper/save-appointments/save-appointments.utils';
import { User } from '@/user/user.entity';

import { PubSub } from 'graphql-subscriptions';

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
