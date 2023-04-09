import { Request } from 'express';
import { User } from '../entity/User.entity';

export interface RequestUser extends Request {
  user: User;
}
