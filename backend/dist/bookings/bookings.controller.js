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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const bookings_service_1 = require("./bookings.service");
const check_availability_dto_1 = require("./dto/check-availability.dto");
const create_room_hold_dto_1 = require("./dto/create-room-hold.dto");
const verify_payment_dto_1 = require("./dto/verify-payment.dto");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    checkAvailability(dto) {
        return this.bookingsService.checkAvailability(dto);
    }
    create(req, dto) {
        return this.bookingsService.create(req.user.id, dto);
    }
    verifyPayment(req, dto) {
        return this.bookingsService.verifyPayment(req.user.id, dto);
    }
    findMyBookings(req) {
        return this.bookingsService.findMyBookings(req.user.id);
    }
    createRoomHold(req, dto) {
        return this.bookingsService.createRoomHold(req.user.id, dto);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)('check-availability'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_availability_dto_1.CheckAvailabilityDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('checkout/verify'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, verify_payment_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('my-bookings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findMyBookings", null);
__decorate([
    (0, common_1.Post)('checkout/hold'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_room_hold_dto_1.CreateRoomHoldDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "createRoomHold", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map