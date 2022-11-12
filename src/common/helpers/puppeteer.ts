import {
  BrowserConnectOptions,
  BrowserLaunchArgumentOptions,
  LaunchOptions,
  Page,
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

export const waitOptions = { visible: true, timeout: 3000 };

export const checkValue = async (
  page: Page,
  selector: string,
  value: string | boolean
): Promise<void> => {
  const response = await page.evaluate(
    (aSelector, aValue) => {
      const value = (<HTMLInputElement>document.querySelector(aSelector))[
        typeof aValue === 'boolean' ? 'checked' : 'value'
      ];

      if (value !== aValue) {
        if (typeof aValue === 'boolean')
          (<HTMLInputElement>document.querySelector(aSelector)).checked =
            aValue;
        else
          (<HTMLInputElement>document.querySelector(aSelector)).value = aValue;

        return false;
      }

      return true;
    },
    selector,
    value
  );

  if (!response) await checkValue(page, selector, value);
};
