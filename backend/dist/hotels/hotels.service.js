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
exports.HotelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HotelsService = class HotelsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.hotel.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const hotel = await this.prisma.hotel.findUnique({
            where: { id },
            include: { rooms: true },
        });
        if (!hotel) {
            throw new common_1.NotFoundException('Hotel not found');
        }
        return hotel;
    }
    async findRooms(id) {
        const hotel = await this.prisma.hotel.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!hotel) {
            throw new common_1.NotFoundException('Hotel not found');
        }
        return this.prisma.room.findMany({
            where: { hotelId: id },
            orderBy: { pricePerNight: 'asc' },
        });
    }
};
exports.HotelsService = HotelsService;
exports.HotelsService = HotelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HotelsService);
//# sourceMappingURL=hotels.service.js.map