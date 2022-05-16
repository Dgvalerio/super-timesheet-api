export const randMore = (value: string) => {
  const date = new Date();
  const time = date.getTime();

  return `${time}_${value}`;
};
