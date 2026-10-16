
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Razorpay from 'razorpay';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class RazorpayService {
  private readonly razorpay: Razorpay;
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new InternalServerErrorException(
        'Razorpay secret is not configured.',
      );
    }

    const expected = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest();

    let received: Buffer;

    try {
      received = Buffer.from(signature, 'hex');
    } catch {
      throw new BadRequestException('Invalid payment signature.');
    }

    return (
      received.length === expected.length &&
      timingSafeEqual(received, expected)
    );
  }

  async fetchPayment(paymentId: string) {
    return this.razorpay.payments.fetch(paymentId);
  }
  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;


    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are missing from .env');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(amountInRupees: string, checkoutId: string) {
    const amountInPaise = Math.round(
      Number(amountInRupees) * 100,
    );

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      throw new InternalServerErrorException(
        'Invalid payment amount.',
      );
    }

    return this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: checkoutId,
      notes: { checkoutId },
    });
  }
}
