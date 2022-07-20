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

export const formatMinutesToTime = (totalMinutes: number): string => {
  const aux = {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };

  const hours = String(aux.hours).padStart(2, '0');
  const minutes = String(aux.minutes).padStart(2, '0');

  return `${hours}:${minutes}`;
};

export const brDateToISO = (date: string) => {
  const [day, month, year] = date.split('/');

  return `${year}-${month}-${day}T00:00:00.000Z`;
};
