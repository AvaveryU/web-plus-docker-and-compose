import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Get,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { CreateWishDto } from '../dto/create-wish.dto';
import { UpdateWishDto } from '../dto/update-wish.dto';
import { RequestUser } from '../utils/utils';
import { WishesService } from './wishes.service';

@Controller('wishes')
export class WishesController {
  constructor(private wishesService: WishesService) {}

  @Get(':id')
  getWishById(@Param('id') id: number) {
    return this.wishesService.getWishById(id);
  }

  @Get('last')
  getLastWish() {
    return this.wishesService.findBottomWishes();
  }

  @Get('top')
  getTopWish() {
    return this.wishesService.findTopWishes();
  }

  @Post()
  create(@Body() createWishDto: CreateWishDto, @Req() req: RequestUser) {
    return this.wishesService.create(req.user, createWishDto);
  }

  @Post(':id/copy')
  copy(@Param('id') id: number, @Req() req: RequestUser) {
    return this.wishesService.copyWish(id, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestUser) {
    return this.wishesService.remove(id, req.user.id);
  }

  @Patch(':id')
  async updateWish(
    @Body() updateWishDto: UpdateWishDto,
    @Param('id') id: number,
    @Req() req: RequestUser,
  ) {
    return this.wishesService.updateOne(updateWishDto, id, req.user.id);
  }
}
