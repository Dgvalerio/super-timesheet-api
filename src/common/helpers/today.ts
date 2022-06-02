import { utcToZonedTime } from 'date-fns-tz';

export const today = (): Date => {
  const date = new Date();

  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  date.setMilliseconds(999);

  return date;
};

export const getNow = () => utcToZonedTime(new Date(), 'America/Sao_Paulo');
