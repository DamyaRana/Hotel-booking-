
import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { RazorpayService } from './razorpay.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, RazorpayService],
  exports: [RazorpayService],
})
export class BookingsModule {}
