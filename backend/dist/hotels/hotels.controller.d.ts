import { HotelsService } from './hotels.service';
export declare class HotelsController {
    private readonly hotelsService;
    constructor(hotelsService: HotelsService);
    findAll(): Promise<{
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findRooms(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: import("@prisma/client/runtime/library").Decimal;
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
}
