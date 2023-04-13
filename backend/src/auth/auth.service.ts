import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entity/User.entity';
import { HashService } from '../hash/hash.service';
import { UsersService } from '../users/users.service';
import * as dotenv from 'dotenv'
dotenv.config()

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashService: HashService,
  ) { }

  async auth(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload
        // , { secret: 'jwt_secret', expiresIn: '24h' }
      )
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findUser(username);
    const pass = password;
    if (user) {
      const validation = await this.hashService.verification(
        pass,
        user.password,
      );
      return validation ? user : null;
    }
    return null;
  }
}
