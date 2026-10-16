import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateRoomHoldDto } from './dto/create-room-hold.dto';
import { RazorpayService } from './razorpay.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class BookingsService {
    private readonly prisma;
    private readonly razorpayService;
    constructor(prisma: PrismaService, razorpayService: RazorpayService);
    private parseDate;
    checkAvailability(dto: CheckAvailabilityDto): Promise<{
        available: boolean;
        hotelId: number;
        checkIn: string;
        checkOut: string;
        roomCount: number;
        availableRoomCount: number;
        nights: number;
        estimatedTotal: string;
        rooms: {
            id: number;
            roomNumber: string;
            pricePerNight: string;
        }[];
        message: string;
    }>;
    create(userId: number, dto: CreateBookingDto): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
        };
        rooms: ({
            room: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                hotelId: number;
                roomNumber: string;
                pricePerNight: Prisma.Decimal;
            };
        } & {
            id: number;
            createdAt: Date;
            pricePerNight: Prisma.Decimal;
            bookingId: number;
            roomId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        checkIn: Date;
        checkOut: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: number;
        roomCount: number;
        guestCount: number;
        totalAmount: Prisma.Decimal;
        paymentId: number | null;
    }>;
    createRoomHold(userId: number, dto: CreateRoomHoldDto): Promise<{
        message: string;
        checkoutId: `${string}-${string}-${string}-${string}-${string}`;
        razorpayOrderId: string;
        razorpayKeyId: string | undefined;
        amount: string | number;
        currency: string;
        expiresAt: Date;
        hotelId: number;
        checkIn: string;
        checkOut: string;
        roomCount: number;
        estimatedTotal: number;
        rooms: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            hotelId: number;
            roomNumber: string;
            pricePerNight: Prisma.Decimal;
        }[];
    }>;
    verifyPayment(userId: number, dto: VerifyPaymentDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        checkIn: Date;
        checkOut: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: number;
        roomCount: number;
        guestCount: number;
        totalAmount: Prisma.Decimal;
        paymentId: number | null;
    }>;
    findMyBookings(userId: number): Promise<({
        rooms: ({
            room: {
                hotel: {
                    id: number;
                    name: string;
                    description: string;
                    city: string;
                    address: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                hotelId: number;
                roomNumber: string;
                pricePerNight: Prisma.Decimal;
            };
        } & {
            id: number;
            createdAt: Date;
            pricePerNight: Prisma.Decimal;
            bookingId: number;
            roomId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        checkIn: Date;
        checkOut: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: number;
        roomCount: number;
        guestCount: number;
        totalAmount: Prisma.Decimal;
        paymentId: number | null;
    })[]>;
}
