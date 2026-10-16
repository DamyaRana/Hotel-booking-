
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  hotelId: number;

  @IsDateString({ strict: true })
  checkIn: string;

  @IsDateString({ strict: true })
  checkOut: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  roomCount: number;
}
