export declare class RazorpayService {
    private readonly razorpay;
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
    fetchPayment(paymentId: string): Promise<import("razorpay/dist/types/payments").Payments.RazorpayPayment>;
    constructor();
    createOrder(amountInRupees: string, checkoutId: string): Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
}
