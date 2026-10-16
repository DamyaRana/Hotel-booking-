import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class AdminRoomsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByHotel(hotelId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: Prisma.Decimal;
    }[]>;
    create(hotelId: number, dto: CreateRoomDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: Prisma.Decimal;
    }>;
    update(id: number, dto: UpdateRoomDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: Prisma.Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: Prisma.Decimal;
    }>;
    private ensureHotelExists;
    private ensureRoomExists;
    private handleDatabaseError;
}
