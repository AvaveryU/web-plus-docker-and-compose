import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { Offer } from '../entity/Offer.entity';
import { User } from '../entity/User.entity';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) { }

  async create(user: User, createOfferDto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.findOne({
      where: { id: createOfferDto.itemId },
      relations: {
        owner: true,
        offers: true,
      },
    });
    const sum = await this.counter(wish.id);
    wish.raised = sum;
    if (
      wish.raised + createOfferDto.amount > wish.price ||
      wish.raised > wish.price
    ) {
      throw new ForbiddenException('Сумма слишком большая');
    }
    if (user.id === wish.owner.id) {
      throw new ForbiddenException('Нельзя скинуться на свой подарок');
    }
    const newOffer = this.offersRepository.create({
      ...createOfferDto,
      user: user,
      item: wish,
    });
    if (!newOffer.hidden) {
      delete newOffer.user;
      return this.offersRepository.save(newOffer);
    }
    delete newOffer.user.email;
    delete newOffer.user.password;
    delete newOffer.item.owner.email;
    delete newOffer.item.owner.password;
    return this.offersRepository.save(newOffer);
  }

  async counter(id: number) {
    const wish = this.wishesService.findOne({
      where: { id: id },
      relations: {
        offers: true,
      },
    });
    const arr = (await wish).offers.map((i) => Number(i.amount));
    const counter = arr.reduce((a, v) => {
      return a + v;
    }, 0);
    return counter;
  }

  async findOne(query: FindOneOptions<Offer>): Promise<Offer> {
    return this.offersRepository.findOne(query);
  }

  async findMany(query: FindManyOptions<Offer>) {
    return this.offersRepository.find(query);
  }

  async updateOne(updateWishDto: Offer, id: number, userId: number) {
    const offer = await this.offersRepository.findOne({
      where: [{ id: +id }],
      relations: {
        user: true,
      },
    });
    if (userId === offer.user.id) return;
    return this.offersRepository.update(id, updateWishDto);
  }

  async getOfferById(id: number) {
    const offer = await this.offersRepository.findOne({
      where: [{ id: +id }],
      relations: {
        user: { offers: true, wishes: true, wishlists: true },
        item: { offers: true, owner: true },
      },
    });
    if (!offer) {
      throw new NotFoundException();
    }
    offer.amount = Number(offer.amount);
    delete offer.item.owner.email;
    delete offer.item.owner.password;
    offer.item.price = Number(offer.item.price);
    return offer;
  }

  async getOffers() {
    const list = await this.findMany({
      relations: {
        item: { offers: true, owner: true },
        user: {
          offers: { item: true },
          wishes: { offers: true, owner: true },
          wishlists: true,
        },
      },
    });
    list.forEach((i) => {
      i.amount = Number(i.amount);
      i.item.price = Number(i.item.price);
      delete i.item.owner.email;
      delete i.item.owner.password;
      i.user?.wishes.forEach((i) => (i.price = Number(i.price)));
    });
    return list;
  }

  async removeById(id: number, userId: number) {
    const offer = await this.offersRepository.findOne({
      where: [{ id: +id }],
      relations: {
        user: true,
      },
    });
    if (userId === offer.user.id) return;
    return this.offersRepository.delete({ id });
  }
}
