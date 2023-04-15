import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { OffersModule } from './offers/offers.module';
import configurations from './configurations/configurations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { Wish } from './entity/Wish.entity';
import { Offer } from './entity/Offer.entity';
import { WishList } from './entity/WishList.entity';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv'
dotenv.config()

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configurations], isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: true,
      entities: [User, Wish, Offer, WishList],
    }),
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
