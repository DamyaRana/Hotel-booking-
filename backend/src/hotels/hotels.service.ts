
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/hotels
  async findAll() {
    return this.prisma.hotel.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // GET /api/hotels/:id
  async findOne(id: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: { rooms: true },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }

  // GET /api/hotels/:id/rooms
  async findRooms(id: number) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return this.prisma.room.findMany({
      where: { hotelId: id },
      orderBy: { pricePerNight: 'asc' },
    });
  }
}
