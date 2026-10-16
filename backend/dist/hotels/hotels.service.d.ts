import { PrismaService } from '../prisma/prisma.service';
export declare class HotelsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        rooms: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            hotelId: number;
            roomNumber: string;
            pricePerNight: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findRooms(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
