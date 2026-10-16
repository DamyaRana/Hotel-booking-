
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingsService } from './bookings.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateRoomHoldDto } from './dto/create-room-hold.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
  ) {}
  @Post('check-availability')
  checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.bookingsService.checkAvailability(dto);
  }
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(
      req.user.id,
      dto,
    );
  }
  @Post('checkout/verify')
  verifyPayment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.bookingsService.verifyPayment(req.user.id, dto);
  }
  @Get('my-bookings')
  findMyBookings(@Req() req: AuthenticatedRequest) {
    return this.bookingsService.findMyBookings(
      req.user.id,
    );
  }
  @Post('checkout/hold')
  createRoomHold(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRoomHoldDto,
  ) {
    return this.bookingsService.createRoomHold(
      req.user.id,
      dto,
    );
  }
}
