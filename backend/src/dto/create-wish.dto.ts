import { IsUrl, IsInt, IsNotEmpty, Length, IsString } from 'class-validator';

export class CreateWishDto {
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsUrl()
  link: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @Length(1, 1024)
  @IsString()
  description: string;
}
