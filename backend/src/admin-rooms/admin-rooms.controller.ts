import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from '../admin-auth/admin-role.guard';
import { AdminRoomsService } from './admin-rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminRoomsController {
  constructor(
    private readonly adminRoomsService: AdminRoomsService,
  ) {}

  @Get('hotels/:hotelId/rooms')
  findByHotel(
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ) {
    return this.adminRoomsService.findByHotel(hotelId);
  }

  @Post('hotels/:hotelId/rooms')
  create(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Body() dto: CreateRoomDto,
  ) {
    return this.adminRoomsService.create(hotelId, dto);
  }

  @Patch('rooms/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.adminRoomsService.update(id, dto);
  }

  @Delete('rooms/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminRoomsService.remove(id);
  }
}