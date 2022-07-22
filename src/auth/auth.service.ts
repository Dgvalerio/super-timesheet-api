import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthInput } from '@/auth/dto/auth.input';
import { AuthOutput } from '@/auth/dto/auth.output';
import { JWTPayload } from '@/auth/jwt.strategy';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { compareSync } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  decodeToken(token: string): string {
    const { sub } = this.jwtService.decode(token);

    return sub;
  }

  async jwtToken(user: User): Promise<string> {
    const payload: JWTPayload = { name: user.name, sub: user.id };

    return this.jwtService.signAsync(payload);
  }

  async validateUser(input: AuthInput): Promise<AuthOutput> {
    const user = await this.userService.getUser({ email: input.email });

    if (!user) {
      throw new NotFoundException('Nenhum usuário foi encontrado');
    }

    const validPassword = compareSync(input.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Senha incorreta!');
    }

    const token = await this.jwtToken(user);

    return {
      user,
      token,
    };
  }
}
