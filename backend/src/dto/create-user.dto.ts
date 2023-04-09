import { IsEmail, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @Length(2, 30)
  @IsNotEmpty()
  username: string;

  @IsOptional()
  avatar: string;

  @Length(2, 200)
  @IsOptional()
  about: string;
}
