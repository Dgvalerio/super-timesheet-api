import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { decryptPassword } from '@/common/helpers/cryptography';
import { UpdateParams } from '@/scrapper/dto/update.params';

import { firstValueFrom } from 'rxjs';

@Injectable()
export class ScrapperService {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
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
}
