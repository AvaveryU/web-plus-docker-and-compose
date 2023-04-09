import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { CreateWishDto } from '../dto/create-wish.dto';
import { UpdateWishDto } from '../dto/update-wish.dto';
import { User } from '../entity/User.entity';
import { Wish } from '../entity/Wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    delete owner.email;
    delete owner.password;
    const newWish = this.wishesRepository.create({
      ...createWishDto,
      owner: owner,
    });
    return this.wishesRepository.save(newWish);
  }

  async findOne(query: FindOneOptions<Wish>): Promise<Wish> {
    return this.wishesRepository.findOne(query);
  }

  async findMany(query: FindManyOptions<Wish>) {
    return this.wishesRepository.find(query);
  }

  async updateOne(updateWishDto: UpdateWishDto, id: number, userId: number) {
    const wish = await this.wishesRepository.findOne({
      where: [{ id: +id }],
      relations: {
        owner: true,
        offers: true,
      },
    });
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Это чужой подарок, оставь!');
    }
    if (wish.offers.length > 0 && wish.raised > 0) {
      throw new ForbiddenException('Редактирование стоимости невозможно');
    }
    await this.wishesRepository.update(id, updateWishDto);
  }

  async getWishById(id: number) {
    const wish = await this.wishesRepository.findOne({
      where: [{ id: id }],
      relations: {
        owner: true,
        offers: {
          item: true,
          user: { offers: true, wishes: true, wishlist: true },
        },
      },
    });
    if (!wish) {
      throw new NotFoundException();
    }
    const count = wish.offers.map((i) => Number(i.amount));
    wish.raised = count.reduce((a, v) => {
      return a + v;
    }, 0);
    delete wish.owner.email;
    delete wish.owner.password;
    return wish;
  }

  async findTopWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({ take: 10, order: { copied: 'DESC' } });
  }

  async findBottomWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      take: 40,
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number, userId: number) {
    const wish = await this.findOne({
      where: [{ id: id }],
      relations: {
        owner: true,
        offers: {
          item: true,
          user: { offers: true, wishes: true, wishlist: true },
        },
      },
    });
    if (!wish) {
      throw new NotFoundException();
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Это чужой подарок, удаление невозможно!');
    }
    await this.wishesRepository.delete({ id });
    delete wish.owner.email;
    delete wish.owner.password;
    return wish;
  }

  async copyWish(wishId: number, owner: User) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: {
        owner: true,
      },
    });
    const name = wish.name;
    const link = wish.link;
    const price = wish.price;
    const wishExist = !!(await this.findOne({
      where: {
        name,
        link,
        price,
        owner: { id: owner.id },
      },
      relations: {
        owner: true,
      },
    }));
    if (!wishExist) {
      throw new NotFoundException('Подарок уже был скопирован');
    }
    if (!wish) {
      throw new NotFoundException();
    }
    const copiedWishDto = {
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
    };
    const copiedWish = await this.create(owner, copiedWishDto);
    if (copiedWish) {
      const newWish = {
        ...wish,
        copied: wish.copied + 1,
      };
      await this.updateOne(newWish, newWish.id, newWish.owner.id);
    }
    return {};
  }
}
