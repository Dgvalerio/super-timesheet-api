import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Resolver, Subscription } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { AuthService } from '@/auth/auth.service';
import {
  SaveAppointmentsProgress,
  WATCH_SAVE_APPOINTMENTS,
} from '@/scrapper/save-appointments/dto/save-appointments.output';
import { SaveAppointmentsService } from '@/scrapper/save-appointments/save-appointments.service';
import { User } from '@/user/user.entity';

import { PubSub } from 'graphql-subscriptions';
import { IncomingMessage } from 'http';

@Resolver()
export class SaveAppointmentsResolver {
  constructor(
    private saveAppointmentsService: SaveAppointmentsService,
    private pubSub: PubSub,
    private authService: AuthService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async saveAppointments(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<boolean> {
    return await this.saveAppointmentsService.saveAppointments(req.user);
  }

  @Subscription(() => SaveAppointmentsProgress, {
    filter(
      this: SaveAppointmentsResolver,
      payload: { [WATCH_SAVE_APPOINTMENTS]: SaveAppointmentsProgress },
      variables,
      context,
    ) {
      const token = context.token || context.Authorization.split(` `)[1];
      const userId = this.authService.decodeToken(token);

      return payload[WATCH_SAVE_APPOINTMENTS].userId === userId;
    },
  })
  watchSaveAppointments(): AsyncIterator<SaveAppointmentsProgress> {
    return this.pubSub.asyncIterator<SaveAppointmentsProgress>(
      WATCH_SAVE_APPOINTMENTS,
    );
  }
}
