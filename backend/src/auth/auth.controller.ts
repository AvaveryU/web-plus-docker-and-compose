import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { RequestUser } from '../utils/utils';
import { AuthService } from './auth.service';
import { LocalGuard } from './local.guard';

@Controller()
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) { }

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req: RequestUser) {
    return this.authService.auth(req.user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    this.authService.auth(user);
    delete user.password;
    return user;
  }
}
