import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Get,
  NotFoundException,
  Header,
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

  @Get('me')
  async getUserMe(@Req() req: RequestUser): Promise<User> {
    return req.user
  }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    const user = await this.usersService.findUser(username);
    if (!user) {
      throw new NotFoundException();
    }
    delete user.email;
    delete user.password;
    return user;
  }

  @Get('me/wishes')
  @Header('Content-Type', 'application/json')
  async getUserMeWishes(@Req() req: RequestUser) {
    return this.usersService.getUserWishes(req.user.id);
  }

  @Get(':username/wishes')
  @Header('Content-Type', 'application/json')
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
