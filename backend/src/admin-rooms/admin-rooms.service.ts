import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class AdminRoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByHotel(hotelId: number) {
    await this.ensureHotelExists(hotelId);

    return this.prisma.room.findMany({
      where: { hotelId },
      orderBy: { roomNumber: 'asc' },
    });
  }

  async create(hotelId: number, dto: CreateRoomDto) {
    await this.ensureHotelExists(hotelId);

    try {
      return await this.prisma.room.create({
        data: {
          hotelId,
          roomNumber: dto.roomNumber.trim(),

          pricePerNight: dto.pricePerNight,

        },
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.ensureRoomExists(id);

    const data: Prisma.RoomUpdateInput = {};

    if (dto.roomNumber !== undefined) {
      data.roomNumber = dto.roomNumber.trim();
    }



    if (dto.pricePerNight !== undefined) {
      data.pricePerNight = dto.pricePerNight;
    }


    try {
      return await this.prisma.room.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(id: number) {
    await this.ensureRoomExists(id);

    try {
      return await this.prisma.room.delete({
        where: { id },
      });
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private async ensureHotelExists(id: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel ${id} was not found`);
    }
  }

  private async ensureRoomExists(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!room) {
      throw new NotFoundException(`Room ${id} was not found`);
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'That room number already exists in this hotel',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new ConflictException(
        'This room has related bookings and cannot be deleted',
      );
    }

    throw error;
  }
}
