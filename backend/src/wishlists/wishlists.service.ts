import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { CreateWishListDto } from '../dto/create-wishlist.dto';
import { UpdateWishListDto } from '../dto/update-wishlist.dto';
import { User } from '../entity/User.entity';
import { WishList } from '../entity/WishList.entity';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishList)
    private wishListRepository: Repository<WishList>,
    private wishesService: WishesService,
  ) { }

  async create(owner: User, createWishListDto: CreateWishListDto) {
    delete owner.email;
    delete owner.password;
    const wishList = await this.wishesService.findMany({});
    const wishes = createWishListDto.itemsId.map((i) =>
      wishList.find((wish) => wish.id === i),
    );
    const newWishList = this.wishListRepository.create({
      ...createWishListDto,
      owner: owner,
      items: wishes,
    });
    return this.wishListRepository.save(newWishList);
  }

  async findOne(query: FindOneOptions<WishList>): Promise<WishList> {
    return this.wishListRepository.findOne(query);
  }

  async findMany(query: FindManyOptions<WishList>) {
    return this.wishListRepository.find(query);
  }

  async updateOne(
    updateWishListDto: UpdateWishListDto,
    id: string,
    userId: number,
  ) {
    const list = await this.findOne({
      where: [{ id: +id }],
      relations: {
        owner: true,
        items: true,
      },
    });
    if (userId !== list.owner.id) {
      throw new ForbiddenException('Это чужой список подарок, оставь!');
    }
    await this.wishListRepository.update(id, updateWishListDto);
    const updatedList = await this.findOne({
      where: { id: +id },
      relations: {
        owner: true,
        items: true,
      },
    });
    delete updatedList.owner.email;
    delete updatedList.owner.password;
    return updatedList;
  }

  async getListById(id: string) {
    const list = await this.wishListRepository.findOne({
      where: [{ id: +id }],
      relations: {
        owner: true,
        items: { offers: true },
      },
    });
    if (!list) {
      throw new NotFoundException();
    }
    list.items.forEach((i) => {
      const counter = i.offers.map((offer) => Number(offer.amount));
      i.raised = counter.reduce((a, v) => {
        return a + v;
      }, 0);
    });
    delete list.owner.email;
    delete list.owner.password;
    return list;
  }

  async getList() {
    const list = await this.findMany({
      relations: {
        owner: true,
        items: true,
      },
    });
    list.forEach((i) => {
      delete i.owner.email;
      delete i.owner.password;
    });
    return list;
  }

  async removeById(id: number) {
    return this.wishListRepository.delete({ id });
  }

  async remove(id: number, userId: number) {
    const list = await this.findOne({
      where: { id: id },
      relations: {
        owner: true,
        items: true,
      },
    });
    if (!list) {
      throw new NotFoundException();
    }
    if (userId !== list.owner.id) {
      throw new ForbiddenException('Это чужие подарки, удаление невозможно!');
    }
    await this.removeById(id);
    delete list.owner.email;
    delete list.owner.password;
    return list;
  }
}
