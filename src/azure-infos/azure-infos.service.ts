import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { CreateAzureInfosInput } from '@/azure-infos/dto/create-azure-infos.input';
import { DeleteAzureInfosInput } from '@/azure-infos/dto/delete-azure-infos.input';
import { GetAzureInfosInput } from '@/azure-infos/dto/get-azure-infos.input';
import { UpdateAzureInfosInput } from '@/azure-infos/dto/update-azure-infos.input';
import { decryptPassword } from '@/common/helpers/cryptography';
import { CryptoHash } from '@/common/interfaces/crypto-hash';
import { AuthVerifyService } from '@/scrapper/auth-verify/auth-verify.service';
import { SeedService } from '@/scrapper/seed/seed.service';
import { UserService } from '@/user/user.service';

import { randomBytes, createCipheriv, scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { promisify } from 'util';

@Injectable()
export class AzureInfosService {
  constructor(
    @InjectRepository(AzureInfos)
    private azureInfosRepository: Repository<AzureInfos>,
    private userService: UserService,
    private authVerifyService: AuthVerifyService,
    private seedService: SeedService,
  ) {}

  private static async encryptPassword(text: string): Promise<CryptoHash> {
    const iv = randomBytes(16);
    const key: Buffer = (await promisify(scrypt)(
      `${process.env.AZURE_SECRET}`,
      'salt',
      32,
    )) as Buffer;

    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    };
  }

  async createAzureInfos(input: CreateAzureInfosInput): Promise<AzureInfos> {
    const user = await this.userService.getUser(
      input.userId ? { id: input.userId } : { email: input.userEmail },
    );

    if (!user) {
      throw new NotFoundException('O usuário informado não existe!');
    }

    const conflicting = await this.getAzureInfos({ login: input.login });

    if (conflicting) {
      throw new ConflictException('Esse login já foi salvo!');
    }

    console.log('createAzureInfos [0]', {
      login: input.login,
      password: input.password,
    });

    const validAuth = await this.authVerifyService.authVerify({
      login: input.login,
      password: input.password,
    });

    console.log('createAzureInfos [1]', !validAuth || validAuth.length === 0, {
      validAuth,
    });

    if (!validAuth || validAuth.length === 0) {
      throw new BadRequestException('Autenticação inválida!');
    }

    const { iv, content } = await AzureInfosService.encryptPassword(
      input.password,
    );

    console.log('createAzureInfos [2]', { iv, content });

    const created = this.azureInfosRepository.create({
      login: input.login,
      iv,
      content,
      user,
    });
    const saved = await this.azureInfosRepository.save(created);

    console.log('createAzureInfos [3]', { created, saved });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao cadastrar suas informações',
      );
    }

    const updatedUser = await this.userService.getUser({ id: user.id });

    await this.seedService.importUserData(updatedUser);

    return this.getAzureInfos({ id: saved.id });
  }

  async getAzureInfos(params: GetAzureInfosInput): Promise<AzureInfos | null> {
    let where = {};

    if (params.id) {
      where = { id: params.id };
    } else if (params.login) {
      where = { login: params.login };
    } else {
      throw new BadRequestException('Nenhum parâmetro válido foi informado');
    }

    return this.azureInfosRepository.findOne({
      where,
      relations: { user: true },
    });
  }

  async updateAzureInfos(input: UpdateAzureInfosInput): Promise<AzureInfos> {
    const newData: Partial<AzureInfos> = {};
    const azureInfos = await this.getAzureInfos({ id: input.id });

    if (!azureInfos) {
      throw new NotFoundException('As informações solicitadas não existem!');
    }

    if (input.login && input.login !== azureInfos.login) {
      const haveCodeConflict = await this.getAzureInfos({ login: input.login });

      if (haveCodeConflict) {
        throw new ConflictException('Esse login já foi utilizado!');
      }

      newData.login = input.login;
    }

    if (input.password) {
      const { iv, content } = await AzureInfosService.encryptPassword(
        input.password,
      );

      if (iv !== azureInfos.iv || content !== azureInfos.content) {
        newData.iv = iv;
        newData.content = content;
      }
    }

    if (
      input.currentMonthWorkedTime &&
      input.currentMonthWorkedTime !== azureInfos.currentMonthWorkedTime
    ) {
      newData.currentMonthWorkedTime = input.currentMonthWorkedTime;
    }

    if (Object.keys(newData).length === 0) {
      return azureInfos;
    }

    if (newData.iv || newData.content || newData.login) {
      const params = {
        login: newData.login ? input.login : azureInfos.login,
        password:
          newData.iv || newData.content
            ? input.password
            : await decryptPassword({
                iv: azureInfos.iv,
                content: azureInfos.content,
              }),
      };

      const validAuth = await this.authVerifyService.authVerify(params);

      if (!validAuth || validAuth.length === 0) {
        throw new BadRequestException('Autenticação inválida!');
      }

      const updatedUser = await this.userService.getUser({
        id: azureInfos.user.id,
      });

      await this.seedService.importUserData(updatedUser);
    }

    await this.azureInfosRepository.update(azureInfos, { ...newData });

    const saved = await this.azureInfosRepository.save({
      ...azureInfos,
      ...newData,
    });

    if (!saved) {
      throw new InternalServerErrorException(
        'Houve um problema ao atualizar as informações',
      );
    }

    return this.getAzureInfos({ id: input.id });
  }

  async deleteAzureInfos(input: DeleteAzureInfosInput): Promise<boolean> {
    const azureInfos = await this.getAzureInfos(input);

    if (!azureInfos) {
      throw new NotFoundException('As informações solicitadas não existem!');
    }

    const deleted = await this.azureInfosRepository.delete(azureInfos.id);

    return !!deleted;
  }
}
