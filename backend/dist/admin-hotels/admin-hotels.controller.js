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
exports.AdminHotelsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_role_guard_1 = require("../admin-auth/admin-role.guard");
const admin_hotels_service_1 = require("./admin-hotels.service");
const create_hotel_dto_1 = require("./dto/create-hotel.dto");
const update_hotel_dto_1 = require("./dto/update-hotel.dto");
let AdminHotelsController = class AdminHotelsController {
    adminHotelsService;
    constructor(adminHotelsService) {
        this.adminHotelsService = adminHotelsService;
    }
    create(dto) {
        return this.adminHotelsService.create(dto);
    }
    findAll() {
        return this.adminHotelsService.findAll();
    }
    update(id, dto) {
        return this.adminHotelsService.update(id, dto);
    }
    remove(id) {
        return this.adminHotelsService.remove(id);
    }
};
exports.AdminHotelsController = AdminHotelsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_hotel_dto_1.CreateHotelDto]),
    __metadata("design:returntype", void 0)
], AdminHotelsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminHotelsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_hotel_dto_1.UpdateHotelDto]),
    __metadata("design:returntype", void 0)
], AdminHotelsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminHotelsController.prototype, "remove", null);
exports.AdminHotelsController = AdminHotelsController = __decorate([
    (0, common_1.Controller)('admin/hotels'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_role_guard_1.AdminRoleGuard),
    __metadata("design:paramtypes", [admin_hotels_service_1.AdminHotelsService])
], AdminHotelsController);
//# sourceMappingURL=admin-hotels.controller.js.map