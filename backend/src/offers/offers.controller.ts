import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { RequestUser } from '../utils/utils';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  async getOffers() {
    return this.offersService.getOffers();
  }

  @Get(':id')
  getOfferById(@Param('id') id: number) {
    return this.offersService.getOfferById(id);
  }

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: RequestUser) {
    return this.offersService.create(req.user, createOfferDto);
  }
}
