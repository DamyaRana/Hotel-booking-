import { AdminRoomsService } from './admin-rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
export declare class AdminRoomsController {
    private readonly adminRoomsService;
    constructor(adminRoomsService: AdminRoomsService);
    findByHotel(hotelId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    create(hotelId: number, dto: CreateRoomDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: number, dto: UpdateRoomDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: import("@prisma/client/runtime/library").Decimal;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        hotelId: number;
        roomNumber: string;
        pricePerNight: import("@prisma/client/runtime/library").Decimal;
    }>;
}
