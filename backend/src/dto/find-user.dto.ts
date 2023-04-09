import { IsNotEmpty } from 'class-validator';

export class FindUserDto {
  @IsNotEmpty()
  query: string;
}
