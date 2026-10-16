import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roomNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  roomType: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  pricePerNight: number;

  @IsInt()
  @Min(1)
  @Max(50)
  capacity: number;
}