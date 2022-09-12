import { Injectable } from '@nestjs/common';

import { AuthVerifyInput } from '@/scrapper/auth-verify/dto/auth-verify.input';
import {
  AuthVerifyOutput,
  AuthVerifyStatus,
  WATCH_AUTH_VERIFY,
} from '@/scrapper/auth-verify/dto/auth-verify.output';
import { Seed } from '@/scrapper/dto/seed.types';

import { PubSub } from 'graphql-subscriptions';
import puppeteer, {
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  Product,
  LaunchOptions,
} from 'puppeteer';
import Cookie = Seed.Cookie;

export type PuppeteerLaunchOptions = LaunchOptions &
  BrowserLaunchArgumentOptions &
  BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
  };

export const puppeteerOptions: PuppeteerLaunchOptions = {
  args: ['--no-sandbox', '--window-size=1280,768'],
  defaultViewport: { width: 1280, height: 768 },
};

export const baseURL = `https://luby-timesheet.azurewebsites.net`;
export const accountLogin = `${baseURL}/Account/Login`;
export const homeIndex = `${baseURL}/Home/Index`;

@Injectable()
export class AuthVerifyService {
  constructor(private pubSub: PubSub) {}

  progress: AuthVerifyOutput = {
    userId: ``,
    page: AuthVerifyStatus.Wait,
    auth: AuthVerifyStatus.Wait,
    cookies: AuthVerifyStatus.Wait,
    wipe: AuthVerifyStatus.Wait,
  };

  setProgress(newProgress: Partial<AuthVerifyOutput>) {
    this.progress = { ...this.progress, ...newProgress };

    return this.pubSub.publish(WATCH_AUTH_VERIFY, {
      [WATCH_AUTH_VERIFY]: this.progress,
    });
  }

  async authVerify(input: AuthVerifyInput): Promise<Cookie[]> {
    try {
      await this.setProgress({ page: AuthVerifyStatus.Load });

      const browser = await puppeteer.launch(puppeteerOptions);
      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();

      await page.setRequestInterception(true);

      page.on('request', (request) =>
        ['image', 'stylesheet', 'font', 'other'].includes(
          request.resourceType(),
        )
          ? request.abort()
          : request.continue(),
      );

      await this.setProgress({ page: AuthVerifyStatus.Ok });

      await this.setProgress({ auth: AuthVerifyStatus.Load });

      await page.goto(accountLogin);

      await page.waitForSelector('form');

      await page.type('#Login', input.login);

      await page.type('#Password', input.password);

      await page.click('[type="submit"]');

      await this.setProgress({ auth: AuthVerifyStatus.Process });

      await page.waitForSelector('.sidebar-menu', { timeout: 3000 });

      if (page.url() !== homeIndex) {
        await this.setProgress({ auth: AuthVerifyStatus.Fail });

        return [];
      }

      await this.setProgress({
        auth: AuthVerifyStatus.Ok,
        cookies: AuthVerifyStatus.Load,
      });

      const cookies = await page.cookies();

      await this.setProgress({ cookies: AuthVerifyStatus.Process });

      if (!cookies) {
        await this.setProgress({ cookies: AuthVerifyStatus.Fail });

        return [];
      }

      if (cookies.length <= 0) {
        await this.setProgress({ cookies: AuthVerifyStatus.Fail });

        await page.close();
        await browser.close();

        return [];
      }

      await this.setProgress({ cookies: AuthVerifyStatus.Ok });

      if (page) {
        await page.close();
        await context.close();
        await browser.close();
      }

      return cookies;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Sign In failure: ', { e });

      return [];
    }
  }
}
