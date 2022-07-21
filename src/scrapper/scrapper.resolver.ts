import { UseGuards } from '@nestjs/common';
import { Context, Mutation, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { SaveAppointmentOutput } from '@/scrapper/dto/save-appointment.output';
import { ScrapperService } from '@/scrapper/scrapper.service';
import { SeedService } from '@/scrapper/seed.service';
import { User } from '@/user/user.entity';

import { IncomingMessage } from 'http';

@Resolver()
export class ScrapperResolver {
  constructor(
    private scrapperService: ScrapperService,
    private seedService: SeedService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async updateData(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<boolean> {
    return await this.scrapperService.update({ user: req.user });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [String])
  async importData(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<string[]> {
    return await this.seedService.importUserData(req.user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [SaveAppointmentOutput])
  async sendAppointments(
    @Context() { req }: { req: IncomingMessage & { user: User } },
  ): Promise<SaveAppointmentOutput[]> {
    return this.scrapperService.sendAppointments(req.user);
  }
}
