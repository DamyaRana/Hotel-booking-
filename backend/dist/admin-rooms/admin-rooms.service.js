"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoomsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminRoomsService = class AdminRoomsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByHotel(hotelId) {
        await this.ensureHotelExists(hotelId);
        return this.prisma.room.findMany({
            where: { hotelId },
            orderBy: { roomNumber: 'asc' },
        });
    }
    async create(hotelId, dto) {
        await this.ensureHotelExists(hotelId);
        try {
            return await this.prisma.room.create({
                data: {
                    hotelId,
                    roomNumber: dto.roomNumber.trim(),
                    pricePerNight: dto.pricePerNight,
                },
            });
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async update(id, dto) {
        await this.ensureRoomExists(id);
        const data = {};
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
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async remove(id) {
        await this.ensureRoomExists(id);
        try {
            return await this.prisma.room.delete({
                where: { id },
            });
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async ensureHotelExists(id) {
        const hotel = await this.prisma.hotel.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!hotel) {
            throw new common_1.NotFoundException(`Hotel ${id} was not found`);
        }
    }
    async ensureRoomExists(id) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!room) {
            throw new common_1.NotFoundException(`Room ${id} was not found`);
        }
    }
    handleDatabaseError(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002') {
            throw new common_1.ConflictException('That room number already exists in this hotel');
        }
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2003') {
            throw new common_1.ConflictException('This room has related bookings and cannot be deleted');
        }
        throw error;
    }
};
exports.AdminRoomsService = AdminRoomsService;
exports.AdminRoomsService = AdminRoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminRoomsService);
//# sourceMappingURL=admin-rooms.service.js.map