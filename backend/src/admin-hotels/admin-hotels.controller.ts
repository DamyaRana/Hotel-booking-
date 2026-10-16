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
import { AdminHotelsService } from './admin-hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Controller('admin/hotels')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminHotelsController {
  constructor(
    private readonly adminHotelsService: AdminHotelsService,
  ) {}

  @Post()
  create(@Body() dto: CreateHotelDto) {
    return this.adminHotelsService.create(dto);
  }

  @Get()
  findAll() {
    return this.adminHotelsService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHotelDto,
  ) {
    return this.adminHotelsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminHotelsService.remove(id);
  }
}