import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { SeedParams } from '@/scrapper/dto/seed.params';
import { VerifyAuthParams } from '@/scrapper/dto/verify-auth.params';

import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScrapperService {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
  ) {}

  async verifyAuth(azureInfos: VerifyAuthParams): Promise<boolean> {
    try {
      const token = await this.authService.jwtToken(azureInfos.user);

      const res = await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_API}/scrapper/auth-verify`, {
          login: azureInfos.login,
          password: azureInfos.password,
          token,
        }),
      );

      return res.data.authenticationIsValid;
    } catch (e) {
      return false;
    }
  }

  async seed(azureInfos: SeedParams): Promise<void> {
    try {
      const token = await this.authService.jwtToken(azureInfos.user);

      await firstValueFrom(
        this.httpService.post(`${process.env.AUTH_API}/scrapper/seed`, {
          login: azureInfos.login,
          password: azureInfos.password,
          token,
        }),
      );
    } catch (e) {
      console.log(e);
    }
  }
}
