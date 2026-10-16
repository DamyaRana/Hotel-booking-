import { AdminHotelsService } from './admin-hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
export declare class AdminHotelsController {
    private readonly adminHotelsService;
    constructor(adminHotelsService: AdminHotelsService);
    create(dto: CreateHotelDto): Promise<{
        _count: {
            rooms: number;
        };
    } & {
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        _count: {
            rooms: number;
        };
    } & {
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    update(id: number, dto: UpdateHotelDto): Promise<{
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        description: string;
        city: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
