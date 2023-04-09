import { NotEquals, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOfferDto {
  @NotEquals(0)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  hidden?: boolean;

  @IsNotEmpty()
  itemId: number;
}
