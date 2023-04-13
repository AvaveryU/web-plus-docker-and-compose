import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/User.entity';
import { Repository, FindOneOptions, Not } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user';
import { FindUserDto } from '../dto/find-user.dto';
import { HashService } from '../hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashServise: HashService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;
    const finder = await this.userRepository.find({
      where: [{ email: email }, { username: username }],
    });
    if (finder.length !== 0) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован!',
      );
    }

    const hash = await this.hashServise.hashPassword(password);
    const createdUser = this.userRepository.create({
      ...createUserDto,
      password: hash,
    });
    return this.userRepository.save(createdUser);
  }

  async findOne(query: FindOneOptions<User>): Promise<User> {
    return this.userRepository.findOne(query);
  }

  async findUser(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, username } = updateUserDto;
    const user = !!(await this.findOne({
      where: [{ email }, { username }, { id: Not(id) }],
    }));
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashServise.hashPassword(
        updateUserDto.password,
      );
    }
    if (user)
      throw new ConflictException(
        'Пользователь с таким email или username мог быть уже зарегистрирован',
      );
    await this.userRepository.update({ id }, updateUserDto);
    const updatedUser = await this.findOne({
      where: { id: +id },
    });
    delete updatedUser.password;
    return updatedUser;
  }
  // поиск по почте или имени
  async findMany(query: string) {
    return this.userRepository.find({
      where: [{ email: query }, { username: query }],
    });
  }

  async findUserData(findUserDto: FindUserDto) {
    const { query } = findUserDto;
    const user = await this.findMany(query);
    if (!user) return;
    delete user[0].password;
    return user;
  }

  removeOne(id: number) {
    return this.userRepository.delete({ id });
  }

  async getUserWishes(id: number) {
    const user = await this.findOne({
      where: { id: id },
      relations: {
        wishes: {
          owner: true,
          offers: {
            item: { owner: true, offers: true },
            user: { wishes: true, offers: true, wishlist: true },
          },
        },
      },
    });

    const newWishes = user.wishes.filter((wish) => {
      const amount = wish.offers.map((offer) => Number(offer.amount));
      delete wish.owner.password;
      delete wish.owner.email;
      wish.raised = amount.reduce((acc, val) => {
        return acc + val;
      }, 0);
      wish.price = Number(wish.price);
      return wish;
    });

    return newWishes;
  }
}
