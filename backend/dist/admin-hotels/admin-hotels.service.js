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
exports.AdminHotelsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminHotelsService = class AdminHotelsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.$transaction(async (tx) => {
            const hotel = await tx.hotel.create({
                data: {
                    name: dto.name.trim(),
                    city: dto.city.trim(),
                    address: dto.address.trim(),
                    description: dto.description.trim(),
                    rooms: {
                        create: Array.from({ length: dto.totalRooms }, (_, index) => ({
                            roomNumber: String(101 + index),
                            pricePerNight: new client_1.Prisma.Decimal(2000),
                            capacity: 2,
                        })),
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
    async update(id, dto) {
        await this.ensureHotelExists(id);
        const data = {};
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
            throw new common_1.BadRequestException('Provide at least one field to update');
        }
        return this.prisma.hotel.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.ensureHotelExists(id);
        try {
            return await this.prisma.hotel.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003') {
                throw new common_1.ConflictException('This hotel has related rooms or bookings and cannot be deleted');
            }
            throw error;
        }
    }
    async ensureHotelExists(id) {
        const hotel = await this.prisma.hotel.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!hotel) {
            throw new common_1.NotFoundException(`Hotel with ID ${id} was not found`);
        }
    }
};
exports.AdminHotelsService = AdminHotelsService;
exports.AdminHotelsService = AdminHotelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminHotelsService);
//# sourceMappingURL=admin-hotels.service.js.map