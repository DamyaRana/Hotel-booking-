
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from './admin-role.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  getProfile(@Request() req: { user: { id: number } }) {
    return this.authService.getProfile(req.user.id);
  }
}
