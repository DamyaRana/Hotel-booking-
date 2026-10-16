
import { IsDateString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomHoldDto {
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
