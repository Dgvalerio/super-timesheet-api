import { CreateAzureInfosInput } from '@/azure-infos/dto/create-azure-infos.input';

import { makeFakeAzureInfos } from '!/azure-infos/collaborators/makeFakeAzureInfos';

export const makeCreateAzureInfosInput = (): CreateAzureInfosInput => {
  const fakeAzureInfos = makeFakeAzureInfos();

  return {
    login: fakeAzureInfos.login,
    password: fakeAzureInfos.content + fakeAzureInfos.iv,

    userId: fakeAzureInfos.user.id,
    userEmail: fakeAzureInfos.user.email,
  };
};
