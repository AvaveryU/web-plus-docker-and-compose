import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUserDto } from '../dto/find-user.dto';
import { UpdateUserDto } from '../dto/update-user';
import { User } from '../entity/User.entity';
import { RequestUser } from '../utils/utils';
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    const user = await this.usersService.findUser(username);
    delete user.email;
    delete user.password;
    return user;
  }

  @Get('me')
  getUserMe(@Req() req): Promise<User> {
    return this.usersService.findOne(req.user.id);
  }

  @Get('me/wishes')
  async getUserMeWishes(@Req() req: RequestUser) {
    return this.usersService.getUserWishes(req.user.id);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.getUser(username);
    return this.usersService.getUserWishes(user.id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('find')
  async findUserData(@Body() findUserDto: FindUserDto) {
    return this.usersService.findUserData(findUserDto);
  }

  @Patch('me')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestUser,
  ) {
    return this.usersService.updateOne(req.user.id, updateUserDto);
  }
}
