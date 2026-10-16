
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HotelsModule } from './hotels/hotels.module';
import { AuthModule } from './auth/auth.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminHotelsModule } from './admin-hotels/admin-hotels.module';
import { AdminRoomsModule } from './admin-rooms/admin-rooms.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HotelsModule,
    AuthModule,
    AdminAuthModule,
    AdminHotelsModule,
    AdminRoomsModule,
    BookingsModule,
  ],
})
export class AppModule {}
