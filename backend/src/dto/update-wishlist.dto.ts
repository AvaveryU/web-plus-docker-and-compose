import { IsUrl, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateWishListDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  image: string;

  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  itemsId: number[];
}
