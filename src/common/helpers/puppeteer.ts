import {
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  LaunchOptions,
  Product,
} from 'puppeteer';

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

const baseURL = `https://luby-timesheet.azurewebsites.net`;

export const scrapper = {
  baseURL,
  accountLogin: `${baseURL}/Account/Login`,
  homeIndex: `${baseURL}/Home/Index`,
  worksheetRead: `${baseURL}/Worksheet/Read`,
  controlPanelManagerDeveloper: `${baseURL}/ControlPanel/ManagerDeveloper`,
};
