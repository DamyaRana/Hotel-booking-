import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class AdminHotelsService {
  constructor(private readonly prisma: PrismaService) {}


  async create(dto: CreateHotelDto) {
    return this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.create({
        data: {
          name: dto.name.trim(),
          city: dto.city.trim(),
          address: dto.address.trim(),
          description: dto.description.trim(),

          rooms: {
            create: Array.from(
              { length: dto.totalRooms },
              (_, index) => ({
                roomNumber: String(101 + index),
                pricePerNight: new Prisma.Decimal(2000),
                capacity: 2,
              }),
            ),
          },
        },
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      });

      return hotel;
    });
  }

  async findAll() {
    return this.prisma.hotel.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  async update(id: number, dto: UpdateHotelDto) {
    await this.ensureHotelExists(id);

    const data: Prisma.HotelUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.city !== undefined) {
      data.city = dto.city.trim();
    }

    if (dto.address !== undefined) {
      data.address = dto.address.trim();
    }

    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'Provide at least one field to update',
      );
    }

    return this.prisma.hotel.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.ensureHotelExists(id);

    try {
      return await this.prisma.hotel.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'This hotel has related rooms or bookings and cannot be deleted',
        );
      }

      throw error;
    }
  }

  private async ensureHotelExists(id: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!hotel) {
      throw new NotFoundException(
        `Hotel with ID ${id} was not found`,
      );
    }
  }
}
