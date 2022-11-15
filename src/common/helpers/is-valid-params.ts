import InvalidParamsException from '@/common/errors/InvalidParamsException';

const isValidParams = <T = unknown>(params: T): boolean => {
  if (params && Object.keys(params).length > 0) return true;
  else throw new InvalidParamsException();
};

export default isValidParams;
