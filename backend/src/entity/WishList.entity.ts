import {
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Length } from 'class-validator';
import { User } from './User.entity';
import { Wish } from './Wish.entity';

@Entity()
export class WishList {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
  })
  @Length(1, 250)
  name: string;

  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.wishlists)
  owner: User;

  @ManyToOne(() => Wish)
  @JoinTable()
  items: Wish[];
}
