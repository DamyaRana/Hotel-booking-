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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const node_crypto_1 = require("node:crypto");
const razorpay_service_1 = require("./razorpay.service");
const client_2 = require("@prisma/client");
let BookingsService = class BookingsService {
    prisma;
    razorpayService;
    constructor(prisma, razorpayService) {
        this.prisma = prisma;
        this.razorpayService = razorpayService;
    }
    parseDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new common_1.BadRequestException('Dates must use YYYY-MM-DD format.');
        }
        const date = new Date(`${value}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== value) {
            throw new common_1.BadRequestException('Invalid date.');
        }
        return date;
    }
    async checkAvailability(dto) {
        const checkIn = this.parseDate(dto.checkIn);
        const checkOut = this.parseDate(dto.checkOut);
        if (checkOut <= checkIn) {
            throw new common_1.BadRequestException('Check-out must be after check-in.');
        }
        const hotel = await this.prisma.hotel.findUnique({
            where: { id: dto.hotelId },
            select: { id: true },
        });
        if (!hotel) {
            throw new common_1.NotFoundException('Hotel not found.');
        }
        const availableRooms = await this.prisma.room.findMany({
            where: {
                hotelId: dto.hotelId,
                holds: {
                    none: {
                        status: 'ACTIVE',
                        expiresAt: {
                            gt: new Date(),
                        },
                        checkIn: {
                            lt: new Date(dto.checkOut),
                        },
                        checkOut: {
                            gt: new Date(dto.checkIn),
                        },
                    },
                },
                bookings: {
                    none: {
                        booking: {
                            status: {
                                in: [
                                    client_1.BookingStatus.PENDING,
                                    client_1.BookingStatus.CONFIRMED,
                                ],
                            },
                            checkIn: { lt: checkOut },
                            checkOut: { gt: checkIn },
                        },
                    },
                },
            },
            orderBy: [
                { roomNumber: 'asc' },
            ],
        });
        const available = availableRooms.length >= dto.roomCount;
        const nights = Math.round((checkOut.getTime() - checkIn.getTime()) /
            (24 * 60 * 60 * 1000));
        const selectedRooms = available
            ? availableRooms.slice(0, dto.roomCount)
            : [];
        const estimatedTotal = selectedRooms.reduce((sum, room) => sum.add(new client_1.Prisma.Decimal(room.pricePerNight.toString())
            .mul(nights)), new client_1.Prisma.Decimal(0));
        return {
            available,
            hotelId: dto.hotelId,
            checkIn: dto.checkIn,
            checkOut: dto.checkOut,
            roomCount: dto.roomCount,
            availableRoomCount: availableRooms.length,
            nights,
            estimatedTotal: estimatedTotal.toFixed(2),
            rooms: selectedRooms.map((room) => ({
                id: room.id,
                roomNumber: room.roomNumber,
                pricePerNight: room.pricePerNight.toString(),
            })),
            message: available
                ? 'Enough rooms are available for the selected dates.'
                : 'Not enough rooms are available for the selected dates.',
        };
    }
    async create(userId, dto) {
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            throw new common_1.BadRequestException('Invalid customer account.');
        }
        const checkIn = this.parseDate(dto.checkIn);
        const checkOut = this.parseDate(dto.checkOut);
        if (checkOut <= checkIn) {
            throw new common_1.BadRequestException('Check-out must be after check-in.');
        }
        const hotel = await this.prisma.hotel.findUnique({
            where: { id: dto.hotelId },
            select: { id: true },
        });
        if (!hotel) {
            throw new common_1.NotFoundException('Hotel not found.');
        }
        const nights = Math.round((checkOut.getTime() - checkIn.getTime()) /
            (24 * 60 * 60 * 1000));
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                return await this.prisma.$transaction(async (tx) => {
                    const availableRooms = await tx.room.findMany({
                        where: {
                            hotelId: dto.hotelId,
                            bookings: {
                                none: {
                                    booking: {
                                        status: {
                                            in: [
                                                client_1.BookingStatus.PENDING,
                                                client_1.BookingStatus.CONFIRMED,
                                            ],
                                        },
                                        checkIn: { lt: checkOut },
                                        checkOut: { gt: checkIn },
                                    },
                                },
                            },
                        },
                        orderBy: [
                            { pricePerNight: 'asc' },
                            { roomNumber: 'asc' },
                        ],
                    });
                    if (availableRooms.length < dto.roomCount) {
                        throw new common_1.ConflictException('Not enough rooms are available for these dates.');
                    }
                    const selectedRooms = availableRooms.slice(0, dto.roomCount);
                    const totalAmount = selectedRooms.reduce((sum, room) => sum.add(new client_1.Prisma.Decimal(room.pricePerNight.toString()).mul(nights)), new client_1.Prisma.Decimal(0));
                    return tx.booking.create({
                        data: {
                            userId,
                            checkIn,
                            checkOut,
                            guestCount: 1,
                            roomCount: dto.roomCount,
                            totalAmount,
                            status: client_1.BookingStatus.PENDING,
                            rooms: {
                                create: selectedRooms.map((room) => ({
                                    roomId: room.id,
                                    pricePerNight: room.pricePerNight,
                                })),
                            },
                        },
                        include: {
                            rooms: {
                                include: {
                                    room: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    });
                }, {
                    isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
                });
            }
            catch (error) {
                const retryable = error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2034';
                if (retryable && attempt < 2) {
                    continue;
                }
                if (retryable) {
                    throw new common_1.ConflictException('Another booking was processed at the same time. Please try again.');
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('Unable to create booking. Please try again.');
    }
    async createRoomHold(userId, dto) {
        const checkIn = new Date(dto.checkIn);
        const checkOut = new Date(dto.checkOut);
        if (!Number.isFinite(checkIn.getTime()) ||
            !Number.isFinite(checkOut.getTime()) ||
            checkOut <= checkIn) {
            throw new common_1.BadRequestException('Check-out must be after check-in.');
        }
        const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
        const checkoutId = (0, node_crypto_1.randomUUID)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        try {
            const checkout = await this.prisma.$transaction(async (tx) => {
                const hotelRooms = await tx.$queryRaw `
            SELECT "id"
            FROM "Room"
            WHERE "hotelId" = ${dto.hotelId}
            ORDER BY "id"
            FOR UPDATE
          `;
                if (hotelRooms.length === 0) {
                    throw new common_1.BadRequestException('This hotel has no rooms.');
                }
                const now = new Date();
                const rooms = await tx.room.findMany({
                    where: {
                        hotelId: dto.hotelId,
                        bookings: {
                            none: {
                                booking: {
                                    status: { in: ['PENDING', 'CONFIRMED'] },
                                    checkIn: { lt: checkOut },
                                    checkOut: { gt: checkIn },
                                },
                            },
                        },
                        holds: {
                            none: {
                                status: 'ACTIVE',
                                expiresAt: { gt: now },
                                checkIn: { lt: checkOut },
                                checkOut: { gt: checkIn },
                            },
                        },
                    },
                    orderBy: [
                        { pricePerNight: 'asc' },
                        { roomNumber: 'asc' },
                    ],
                    take: dto.roomCount,
                });
                if (rooms.length < dto.roomCount) {
                    throw new common_1.ConflictException(`Only ${rooms.length} rooms are available for these dates.`);
                }
                const totalAmount = rooms.reduce((total, room) => total + Number(room.pricePerNight), 0) * nights;
                await tx.payment.create({
                    data: {
                        checkoutId,
                        userId,
                        amount: totalAmount,
                        expiresAt,
                        status: 'PENDING',
                    },
                });
                await tx.roomHold.createMany({
                    data: rooms.map((room) => ({
                        checkoutId,
                        userId,
                        roomId: room.id,
                        checkIn,
                        checkOut,
                        expiresAt,
                        status: 'ACTIVE',
                    })),
                });
                return {
                    rooms,
                    totalAmount,
                };
            }, {
                isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            });
            try {
                const order = await this.razorpayService.createOrder(String(checkout.totalAmount), checkoutId);
                await this.prisma.payment.update({
                    where: { checkoutId },
                    data: { razorpayOrderId: order.id },
                });
                return {
                    message: 'Rooms held temporarily. Complete payment within 10 minutes.',
                    checkoutId,
                    razorpayOrderId: order.id,
                    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    expiresAt,
                    hotelId: dto.hotelId,
                    checkIn: dto.checkIn,
                    checkOut: dto.checkOut,
                    roomCount: checkout.rooms.length,
                    estimatedTotal: checkout.totalAmount,
                    rooms: checkout.rooms,
                };
            }
            catch (error) {
                await this.prisma.$transaction(async (tx) => {
                    await tx.payment.updateMany({
                        where: {
                            checkoutId,
                            status: 'PENDING',
                        },
                        data: { status: 'FAILED' },
                    });
                    await tx.roomHold.updateMany({
                        where: {
                            checkoutId,
                            status: 'ACTIVE',
                        },
                        data: { status: 'RELEASED' },
                    });
                });
                throw error;
            }
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2034') {
                throw new common_1.ConflictException('Availability changed. Please check again.');
            }
            throw error;
        }
    }
    async verifyPayment(userId, dto) {
        const paymentRecord = await this.prisma.payment.findFirst({
            where: {
                checkoutId: dto.checkoutId,
                userId,
            },
            include: {
                booking: true,
            },
        });
        if (!paymentRecord) {
            throw new common_1.NotFoundException('Checkout or payment record not found.');
        }
        if (paymentRecord.status === client_2.PaymentStatus.PAID) {
            if (paymentRecord.booking) {
                return paymentRecord.booking;
            }
            throw new common_1.ConflictException('Payment is marked paid but its booking is missing.');
        }
        if (paymentRecord.status !== client_2.PaymentStatus.PENDING) {
            throw new common_1.ConflictException('This checkout is no longer awaiting payment.');
        }
        if (!paymentRecord.razorpayOrderId) {
            throw new common_1.BadRequestException('Razorpay order has not been created.');
        }
        const validSignature = this.razorpayService.verifyPaymentSignature(paymentRecord.razorpayOrderId, dto.razorpay_payment_id, dto.razorpay_signature);
        if (!validSignature) {
            throw new common_1.BadRequestException('Invalid Razorpay payment signature.');
        }
        const razorpayPayment = await this.razorpayService.fetchPayment(dto.razorpay_payment_id);
        if (razorpayPayment.order_id !==
            paymentRecord.razorpayOrderId) {
            throw new common_1.BadRequestException('Payment does not belong to this Razorpay order.');
        }
        if (razorpayPayment.status !== 'captured') {
            throw new common_1.ConflictException('Payment has not been captured successfully.');
        }
        if (razorpayPayment.currency !== 'INR' ||
            razorpayPayment.amount !==
                Math.round(Number(paymentRecord.amount) * 100)) {
            throw new common_1.BadRequestException('Payment amount or currency does not match the checkout.');
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const currentPayment = await tx.payment.findUnique({
                    where: {
                        checkoutId: dto.checkoutId,
                    },
                    include: {
                        booking: true,
                    },
                });
                if (!currentPayment || currentPayment.userId !== userId) {
                    throw new common_1.NotFoundException('Checkout not found.');
                }
                if (currentPayment.status === client_2.PaymentStatus.PAID) {
                    if (currentPayment.booking) {
                        return currentPayment.booking;
                    }
                    throw new common_1.ConflictException('Payment is marked paid but its booking is missing.');
                }
                if (currentPayment.status !== client_2.PaymentStatus.PENDING) {
                    throw new common_1.ConflictException('Checkout is no longer awaiting payment.');
                }
                const now = new Date();
                const holds = await tx.roomHold.findMany({
                    where: {
                        checkoutId: dto.checkoutId,
                        userId,
                        status: client_2.RoomHoldStatus.ACTIVE,
                        expiresAt: { gt: now },
                    },
                    include: {
                        room: true,
                    },
                });
                if (holds.length === 0) {
                    throw new common_1.ConflictException('Room holds have expired or been released. Payment needs reconciliation.');
                }
                const firstHold = holds[0];
                const sameStay = holds.every((hold) => hold.room.hotelId === firstHold.room.hotelId &&
                    hold.checkIn.getTime() ===
                        firstHold.checkIn.getTime() &&
                    hold.checkOut.getTime() ===
                        firstHold.checkOut.getTime());
                if (!sameStay) {
                    throw new common_1.ConflictException('The held rooms do not match a single stay.');
                }
                const nights = Math.round((firstHold.checkOut.getTime() -
                    firstHold.checkIn.getTime()) /
                    86400000);
                const heldTotal = holds.reduce((total, hold) => total.add(new client_1.Prisma.Decimal(hold.room.pricePerNight.toString()).mul(nights)), new client_1.Prisma.Decimal(0));
                if (!heldTotal.equals(currentPayment.amount)) {
                    throw new common_1.ConflictException('The held-room total does not match the payment record.');
                }
                const booking = await tx.booking.create({
                    data: {
                        userId,
                        paymentId: currentPayment.id,
                        checkIn: firstHold.checkIn,
                        checkOut: firstHold.checkOut,
                        guestCount: 1,
                        roomCount: holds.length,
                        totalAmount: currentPayment.amount,
                        status: client_1.BookingStatus.CONFIRMED,
                        rooms: {
                            create: holds.map((hold) => ({
                                roomId: hold.roomId,
                                pricePerNight: hold.room.pricePerNight,
                            })),
                        },
                    },
                    include: {
                        rooms: {
                            include: {
                                room: {
                                    include: {
                                        hotel: true,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });
                await tx.payment.update({
                    where: {
                        id: currentPayment.id,
                    },
                    data: {
                        status: client_2.PaymentStatus.PAID,
                        razorpayPaymentId: dto.razorpay_payment_id,
                    },
                });
                await tx.roomHold.updateMany({
                    where: {
                        checkoutId: dto.checkoutId,
                        userId,
                        status: client_2.RoomHoldStatus.ACTIVE,
                    },
                    data: {
                        status: client_2.RoomHoldStatus.CONFIRMED,
                    },
                });
                return booking;
            }, {
                isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            });
        }
        catch (error) {
            if (error instanceof
                client_1.Prisma.PrismaClientKnownRequestError &&
                (error.code === 'P2002' || error.code === 'P2034')) {
                const existingPayment = await this.prisma.payment.findUnique({
                    where: {
                        checkoutId: dto.checkoutId,
                    },
                    include: {
                        booking: true,
                    },
                });
                if (existingPayment?.status === client_2.PaymentStatus.PAID &&
                    existingPayment.booking) {
                    return existingPayment.booking;
                }
                throw new common_1.ConflictException('Payment verification conflicted with another request. Please retry verification.');
            }
            throw error;
        }
    }
    async findMyBookings(userId) {
        return this.prisma.booking.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                rooms: {
                    include: {
                        room: {
                            include: {
                                hotel: true,
                            },
                        },
                    },
                },
            },
        });
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        razorpay_service_1.RazorpayService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map