import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppointmentModule } from '@/appointment/appointment.module';
import { AuthModule } from '@/auth/auth.module';
import { AzureInfosModule } from '@/azure-infos/azure-infos.module';
import { CategoryModule } from '@/category/category.module';
import { ClientModule } from '@/client/client.module';
import { ProjectModule } from '@/project/project.module';
import { ScrapperModule } from '@/scrapper/scrapper.module';
import { UserModule } from '@/user/user.module';

import { Context } from 'graphql-ws';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': {
          onConnect: (
            context: Context<{ token: string }, { token: string }>,
          ) => {
            const { connectionParams, extra } = context;

            if (!connectionParams.token || connectionParams.token === '')
              throw new UnauthorizedException();

            extra.token = connectionParams.token.split(' ')[1];
          },
        },
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => connectionParams,
        },
      },
      context: ({ extra }) => extra,
    }),
    UserModule,
    ClientModule,
    AuthModule,
    ProjectModule,
    CategoryModule,
    AppointmentModule,
    AzureInfosModule,
    ScrapperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
