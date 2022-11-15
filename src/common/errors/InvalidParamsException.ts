import { BadRequestException } from '@nestjs/common';

class InvalidParamsException extends BadRequestException {
  constructor() {
    super('Nenhum parâmetro válido foi informado');
  }
}

export default InvalidParamsException;
