import { Request } from 'express';
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
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
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
    create(req: AuthenticatedRequest, dto: CreateBookingDto): Promise<{
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
                pricePerNight: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            createdAt: Date;
            pricePerNight: import("@prisma/client/runtime/library").Decimal;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentId: number | null;
    }>;
    verifyPayment(req: AuthenticatedRequest, dto: VerifyPaymentDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        checkIn: Date;
        checkOut: Date;
        status: import("@prisma/client").$Enums.BookingStatus;
        userId: number;
        roomCount: number;
        guestCount: number;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentId: number | null;
    }>;
    findMyBookings(req: AuthenticatedRequest): Promise<({
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
                pricePerNight: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: number;
            createdAt: Date;
            pricePerNight: import("@prisma/client/runtime/library").Decimal;
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
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentId: number | null;
    })[]>;
    createRoomHold(req: AuthenticatedRequest, dto: CreateRoomHoldDto): Promise<{
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
            pricePerNight: import("@prisma/client/runtime/library").Decimal;
        }[];
    }>;
}
export {};
