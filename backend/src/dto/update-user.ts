import {
  IsEmail,
  IsUrl,
  IsNotEmpty,
  Length,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  password: string;

  @Length(2, 30)
  @IsOptional()
  username: string;

  @IsOptional()
  @IsUrl()
  avatar: string;

  @Length(2, 200)
  @IsOptional()
  about: string;
}
