
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get(':id/rooms')
  findRooms(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findRooms(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findOne(id);
  }
}
