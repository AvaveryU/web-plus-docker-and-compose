import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Delete, Header, Patch } from '@nestjs/common/decorators';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateWishListDto } from '../dto/create-wishlist.dto';
import { UpdateWishListDto } from '../dto/update-wishlist.dto';
import { RequestUser } from '../utils/utils';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) { }

  @Get()
  getLists() {
    return this.wishlistsService.getList();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getWishListsById(@Param('id') id: string) {
    return this.wishlistsService.getListById(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  create(
    @Body() createWishListDto: CreateWishListDto,
    @Req() req: RequestUser,
  ) {
    return this.wishlistsService.create(req.user, createWishListDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestUser) {
    return this.wishlistsService.remove(id, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  @Header('Content-Type', 'application/json')
  async updateWishLists(
    @Body() updateWishListDto: UpdateWishListDto,
    @Param('id') id: string,
    @Req() req: RequestUser,
  ) {
    return this.wishlistsService.updateOne(updateWishListDto, id, req.user.id);
  }
}
