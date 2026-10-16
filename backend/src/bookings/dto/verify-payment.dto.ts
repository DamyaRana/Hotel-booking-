
import { IsString, IsUUID, Length } from 'class-validator';

export class VerifyPaymentDto {
  @IsUUID()
  checkoutId: string;

  @IsString()
  @Length(1, 100)
  razorpay_payment_id: string;

  @IsString()
  @Length(64, 64)
  razorpay_signature: string;
}
