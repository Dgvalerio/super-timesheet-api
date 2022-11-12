import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JWTPayload {
  sub: User['id'];
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JWTPayload): Promise<User> {
    const user = await this.userService.getUser({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
