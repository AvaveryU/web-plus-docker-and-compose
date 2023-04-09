import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStartegy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { HashService } from '../hash/hash.service';
import { HashModule } from 'src/hash/hash.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    HashModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt_secret') || 'jwt_secret',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, JwtStrategy, LocalStartegy],
  exports: [AuthService],
})
export class AuthModule { }
