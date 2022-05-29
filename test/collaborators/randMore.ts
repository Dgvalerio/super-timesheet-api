import { randAlphaNumeric, randNumber } from '@ngneat/falso';

export const randMore = (value: string) => {
  const date = new Date();
  const time = date.getTime();

  return `${time}${value}`;
};

export const randId = () => randMore(String(randNumber()));

export const randCode = () => randMore(String(randAlphaNumeric()));
