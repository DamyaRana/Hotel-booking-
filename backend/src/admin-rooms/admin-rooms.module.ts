import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminRoleGuard } from '../admin-auth/admin-role.guard';
import { AdminRoomsController } from './admin-rooms.controller';
import { AdminRoomsService } from './admin-rooms.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminRoomsController],
  providers: [AdminRoomsService, AdminRoleGuard],
})
export class AdminRoomsModule {}