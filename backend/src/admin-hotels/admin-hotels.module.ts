import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminRoleGuard } from '../admin-auth/admin-role.guard';
import { AdminHotelsController } from './admin-hotels.controller';
import { AdminHotelsService } from './admin-hotels.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminHotelsController],
  providers: [AdminHotelsService, AdminRoleGuard],
})
export class AdminHotelsModule {}