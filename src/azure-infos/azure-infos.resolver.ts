import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GqlAuthGuard } from '@/auth/auth.guard';
import { AzureInfos } from '@/azure-infos/azure-infos.entity';
import { AzureInfosService } from '@/azure-infos/azure-infos.service';
import { CreateAzureInfosInput } from '@/azure-infos/dto/create-azure-infos.input';
import { DeleteAzureInfosInput } from '@/azure-infos/dto/delete-azure-infos.input';
import { GetAzureInfosInput } from '@/azure-infos/dto/get-azure-infos.input';
import { UpdateAzureInfosInput } from '@/azure-infos/dto/update-azure-infos.input';

@Resolver()
export class AzureInfosResolver {
  constructor(private azureInfosService: AzureInfosService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AzureInfos)
  async createAzureInfos(
    @Args('input') input: CreateAzureInfosInput,
  ): Promise<AzureInfos> {
    return this.azureInfosService.createAzureInfos(input);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => AzureInfos)
  async getAzureInfos(
    @Args('input') input: GetAzureInfosInput,
  ): Promise<AzureInfos> {
    const azureInfos = await this.azureInfosService.getAzureInfos(input);

    if (!azureInfos) {
      throw new NotFoundException('Nenhuma informação foi encontrada');
    }

    return azureInfos;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AzureInfos)
  async updateAzureInfos(
    @Args('input') input: UpdateAzureInfosInput,
  ): Promise<AzureInfos> {
    return this.azureInfosService.updateAzureInfos(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteAzureInfos(
    @Args('input') input: DeleteAzureInfosInput,
  ): Promise<boolean> {
    return this.azureInfosService.deleteAzureInfos(input);
  }
}
