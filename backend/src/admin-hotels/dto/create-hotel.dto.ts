
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  totalRooms: number;
}
