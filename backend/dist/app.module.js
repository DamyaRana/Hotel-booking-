"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const hotels_module_1 = require("./hotels/hotels.module");
const auth_module_1 = require("./auth/auth.module");
const admin_auth_module_1 = require("./admin-auth/admin-auth.module");
const admin_hotels_module_1 = require("./admin-hotels/admin-hotels.module");
const admin_rooms_module_1 = require("./admin-rooms/admin-rooms.module");
const bookings_module_1 = require("./bookings/bookings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            hotels_module_1.HotelsModule,
            auth_module_1.AuthModule,
            admin_auth_module_1.AdminAuthModule,
            admin_hotels_module_1.AdminHotelsModule,
            admin_rooms_module_1.AdminRoomsModule,
            bookings_module_1.BookingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map