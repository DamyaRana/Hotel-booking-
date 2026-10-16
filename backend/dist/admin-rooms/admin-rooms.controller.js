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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoomsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_role_guard_1 = require("../admin-auth/admin-role.guard");
const admin_rooms_service_1 = require("./admin-rooms.service");
const create_room_dto_1 = require("./dto/create-room.dto");
const update_room_dto_1 = require("./dto/update-room.dto");
let AdminRoomsController = class AdminRoomsController {
    adminRoomsService;
    constructor(adminRoomsService) {
        this.adminRoomsService = adminRoomsService;
    }
    findByHotel(hotelId) {
        return this.adminRoomsService.findByHotel(hotelId);
    }
    create(hotelId, dto) {
        return this.adminRoomsService.create(hotelId, dto);
    }
    update(id, dto) {
        return this.adminRoomsService.update(id, dto);
    }
    remove(id) {
        return this.adminRoomsService.remove(id);
    }
};
exports.AdminRoomsController = AdminRoomsController;
__decorate([
    (0, common_1.Get)('hotels/:hotelId/rooms'),
    __param(0, (0, common_1.Param)('hotelId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminRoomsController.prototype, "findByHotel", null);
__decorate([
    (0, common_1.Post)('hotels/:hotelId/rooms'),
    __param(0, (0, common_1.Param)('hotelId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_room_dto_1.CreateRoomDto]),
    __metadata("design:returntype", void 0)
], AdminRoomsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('rooms/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_room_dto_1.UpdateRoomDto]),
    __metadata("design:returntype", void 0)
], AdminRoomsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('rooms/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminRoomsController.prototype, "remove", null);
exports.AdminRoomsController = AdminRoomsController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __metadata("design:paramtypes", [admin_rooms_service_1.AdminRoomsService])
], AdminRoomsController);
//# sourceMappingURL=admin-rooms.controller.js.map