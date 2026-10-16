"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const razorpay_1 = __importDefault(require("razorpay"));
const node_crypto_1 = require("node:crypto");
let RazorpayService = class RazorpayService {
    razorpay;
    verifyPaymentSignature(orderId, paymentId, signature) {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            throw new common_1.InternalServerErrorException('Razorpay secret is not configured.');
        }
        const expected = (0, node_crypto_1.createHmac)('sha256', secret)
            .update(`${orderId}|${paymentId}`)
            .digest();
        let received;
        try {
            received = Buffer.from(signature, 'hex');
        }
        catch {
            throw new common_1.BadRequestException('Invalid payment signature.');
        }
        return (received.length === expected.length &&
            (0, node_crypto_1.timingSafeEqual)(received, expected));
    }
    async fetchPayment(paymentId) {
        return this.razorpay.payments.fetch(paymentId);
    }
    constructor() {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            throw new Error('Razorpay credentials are missing from .env');
        }
        this.razorpay = new razorpay_1.default({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    async createOrder(amountInRupees, checkoutId) {
        const amountInPaise = Math.round(Number(amountInRupees) * 100);
        if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
            throw new common_1.InternalServerErrorException('Invalid payment amount.');
        }
        return this.razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: checkoutId,
            notes: { checkoutId },
        });
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map