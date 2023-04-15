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
  ) { }

  async create(owner: User, createWishDto: CreateWishDto): Promise<Wish> {
    owner?.email && delete owner.email;
    owner?.password && delete owner.password;
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

  async updateOne(updateWishDto: UpdateWishDto, id: string, userId: number) {
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
          user: { offers: true, wishes: true, wishlists: true },
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
    wish.owner?.email && delete wish.owner.email;
    wish.owner?.password && delete wish.owner.password;
    return wish;
  }

  async findTopWishes() {
    const wishes = await this.wishesRepository.find({
      relations: {
        owner: true,
        offers: {
          item: true,
        },
      },
      order: {
        copied: 'DESC',
      },
      take: 10,
    });

    const newWishes = wishes.filter((wish) => {
      if (wish.copied === 0) {
        return;
      }
      return wish;

    });
    newWishes.forEach((wish) => {
      const amount = wish.offers.map((offer) => Number(offer.amount));

      wish.raised = amount.reduce(function (acc, val) {
        return acc + val;
      }, 0);

      wish.owner?.password && delete wish.owner.password;
      wish.owner?.email && delete wish.owner.email;
    });

    return newWishes;
  }

  removeById(id: number) {
    return this.wishesRepository.delete({ id });
  }

  async findBottomWishes() {
    const wishes = await this.wishesRepository.find({
      relations: {
        owner: true,
        offers: {
          item: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });

    wishes.forEach((wish) => {
      const amount = wish.offers.map((offer) => Number(offer.amount));

      wish.raised = amount.reduce(function (acc, val) {
        return acc + val;
      }, 0);

      wish.owner?.password && delete wish.owner.password;
      wish.owner?.email && delete wish.owner.email;
    });

    return wishes;
  }

  async remove(id: number, userId: number) {
    const wish = await this.findOne({
      where: { id: id },
      relations: {
        owner: true,
        offers: {
          item: true,
          user: { offers: true, wishes: true, wishlists: true },
        },
      },
    });
    if (!wish) {
      throw new NotFoundException();
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Это чужой подарок, удаление невозможно!');
    }
    await this.removeById(id);
    wish.owner?.email && delete wish.owner.email;
    wish.owner?.password && delete wish.owner.password;
    return wish;
  }

  async copyWish(wishId: number, owner: User) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: {
        owner: true,
      },
    });
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
      await this.updateOne(newWish, newWish.id.toString(), newWish.owner.id);
    }
    return {};
  }
}
