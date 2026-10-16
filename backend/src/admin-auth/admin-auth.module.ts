import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminRoleGuard } from './admin-role.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminAuthController],
  providers: [AdminRoleGuard],
})
export class AdminAuthModule {}