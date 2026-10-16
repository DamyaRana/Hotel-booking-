
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CreateRoomHoldDto } from './dto/create-room-hold.dto';
import { randomUUID } from 'node:crypto';
import { RazorpayService } from './razorpay.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentStatus, RoomHoldStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
  ) {}
  private parseDate(value: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(
        'Dates must use YYYY-MM-DD format.',
      );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException('Invalid date.');
    }

    return date;
  }

  async checkAvailability(dto: CheckAvailabilityDto) {
    const checkIn = this.parseDate(dto.checkIn);
    const checkOut = this.parseDate(dto.checkOut);

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'Check-out must be after check-in.',
      );
    }

    // if (
    //   !Number.isSafeInteger(dto.hotelId) ||
    //   dto.hotelId <= 0 ||
    //   !Number.isSafeInteger(dto.roomCount) ||
    //   dto.roomCount < 1 ||
    //   dto.roomCount > 20
    // ) {
    //   throw new BadRequestException(
    //     'Hotel ID must be positive and room count must be between 1 and 20.',
    //   );
    // }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: dto.hotelId },
      select: { id: true },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
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
                  BookingStatus.PENDING,
                  BookingStatus.CONFIRMED,
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

    const nights = Math.round(
      (checkOut.getTime() - checkIn.getTime()) /
        (24 * 60 * 60 * 1000),
    );

    const selectedRooms = available
      ? availableRooms.slice(0, dto.roomCount)
      : [];

    const estimatedTotal = selectedRooms.reduce(
      (sum, room) =>
        sum.add(
          new Prisma.Decimal(room.pricePerNight.toString())
            .mul(nights),
        ),
      new Prisma.Decimal(0),
    );

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

  async create(userId: number, dto: CreateBookingDto) {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new BadRequestException(
        'Invalid customer account.',
      );
    }

    const checkIn = this.parseDate(dto.checkIn);
    const checkOut = this.parseDate(dto.checkOut);

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        'Check-out must be after check-in.',
      );
    }

    // if (
    //   !Number.isSafeInteger(dto.hotelId) ||
    //   dto.hotelId <= 0 ||
    //   !Number.isSafeInteger(dto.roomCount) ||
    //   dto.roomCount < 1 ||
    //   dto.roomCount > 20
    // ) {
    //   throw new BadRequestException(
    //     'Hotel ID and room count must be valid positive integers. Room count cannot exceed 20.',
    //   );
    // }

    const hotel = await this.prisma.hotel.findUnique({
      where: { id: dto.hotelId },
      select: { id: true },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    const nights = Math.round(
      (checkOut.getTime() - checkIn.getTime()) /
        (24 * 60 * 60 * 1000),
    );

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const availableRooms = await tx.room.findMany({
              where: {
                hotelId: dto.hotelId,
                bookings: {
                  none: {
                    booking: {
                      status: {
                        in: [
                          BookingStatus.PENDING,
                          BookingStatus.CONFIRMED,
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
              throw new ConflictException(
                'Not enough rooms are available for these dates.',
              );
            }

            const selectedRooms = availableRooms.slice(
              0,
              dto.roomCount,
            );

            const totalAmount = selectedRooms.reduce(
              (sum, room) =>
                sum.add(
                  new Prisma.Decimal(
                    room.pricePerNight.toString(),
                  ).mul(nights),
                ),
              new Prisma.Decimal(0),
            );

            return tx.booking.create({
              data: {
                userId,
                checkIn,
                checkOut,
                guestCount: 1,
                roomCount: dto.roomCount,
                totalAmount,
                status: BookingStatus.PENDING,
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
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';

        if (retryable && attempt < 2) {
          continue;
        }

        if (retryable) {
          throw new ConflictException(
            'Another booking was processed at the same time. Please try again.',
          );
        }

        throw error;
      }
    }

    throw new ConflictException(
      'Unable to create booking. Please try again.',
    );
  }

  async createRoomHold(userId: number, dto: CreateRoomHoldDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (
      !Number.isFinite(checkIn.getTime()) ||
      !Number.isFinite(checkOut.getTime()) ||
      checkOut <= checkIn
    ) {
      throw new BadRequestException(
        'Check-out must be after check-in.',
      );
    }

    const nights = Math.round(
      (checkOut.getTime() - checkIn.getTime()) / 86400000,
    );

    const checkoutId = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      // 1. Select and temporarily hold rooms in one transaction.
      const checkout = await this.prisma.$transaction(
        async (tx) => {
          const hotelRooms = await tx.$queryRaw<{ id: number }[]>`
            SELECT "id"
            FROM "Room"
            WHERE "hotelId" = ${dto.hotelId}
            ORDER BY "id"
            FOR UPDATE
          `;

          if (hotelRooms.length === 0) {
            throw new BadRequestException(
              'This hotel has no rooms.',
            );
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
            throw new ConflictException(
              `Only ${rooms.length} rooms are available for these dates.`,
            );
          }

          const totalAmount =
            rooms.reduce(
              (total, room) =>
                total + Number(room.pricePerNight),
              0,
            ) * nights;

          // Create Payment first because RoomHold references checkoutId.
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
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      // 2. Create the Razorpay order AFTER the transaction commits.
      try {
        const order = await this.razorpayService.createOrder(
          String(checkout.totalAmount),
          checkoutId,
        );

        // 3. Save the Razorpay order ID.
        await this.prisma.payment.update({
          where: { checkoutId },
          data: { razorpayOrderId: order.id },
        });

        // 4. Return the details needed by the frontend.
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
      } catch (error) {
        // Release holds if order creation or saving the order fails.
        // Do not release holds if payment has already been marked PAID.
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Availability changed. Please check again.',
        );
      }

      throw error;
    }
  }

  async verifyPayment(
    userId: number,
    dto: VerifyPaymentDto,
  ) {
    // 1. Find the payment belonging to this customer.
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
      throw new NotFoundException(
        'Checkout or payment record not found.',
      );
    }

    // 2. Make repeated verification requests safe.
    if (paymentRecord.status === PaymentStatus.PAID) {
      if (paymentRecord.booking) {
        return paymentRecord.booking;
      }

      throw new ConflictException(
        'Payment is marked paid but its booking is missing.',
      );
    }

    if (paymentRecord.status !== PaymentStatus.PENDING) {
      throw new ConflictException(
        'This checkout is no longer awaiting payment.',
      );
    }

    if (!paymentRecord.razorpayOrderId) {
      throw new BadRequestException(
        'Razorpay order has not been created.',
      );
    }

    // 3. Verify the signature using the order ID stored on the server.
    const validSignature =
      this.razorpayService.verifyPaymentSignature(
        paymentRecord.razorpayOrderId,
        dto.razorpay_payment_id,
        dto.razorpay_signature,
      );

    if (!validSignature) {
      throw new BadRequestException(
        'Invalid Razorpay payment signature.',
      );
    }

    // 4. Fetch the payment directly from Razorpay.
    const razorpayPayment =
      await this.razorpayService.fetchPayment(
        dto.razorpay_payment_id,
      );

    if (
      razorpayPayment.order_id !==
      paymentRecord.razorpayOrderId
    ) {
      throw new BadRequestException(
        'Payment does not belong to this Razorpay order.',
      );
    }

    // A valid signature alone does not prove payment was captured.
    if (razorpayPayment.status !== 'captured') {
      throw new ConflictException(
        'Payment has not been captured successfully.',
      );
    }

    if (
      razorpayPayment.currency !== 'INR' ||
      razorpayPayment.amount !==
        Math.round(Number(paymentRecord.amount) * 100)
    ) {
      throw new BadRequestException(
        'Payment amount or currency does not match the checkout.',
      );
    }

    // 5. Create the booking and confirm holds atomically.
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // Recheck payment state in the transaction.
          const currentPayment =
            await tx.payment.findUnique({
              where: {
                checkoutId: dto.checkoutId,
              },
              include: {
                booking: true,
              },
            });

          if (!currentPayment || currentPayment.userId !== userId) {
            throw new NotFoundException(
              'Checkout not found.',
            );
          }

          // Another request may have completed verification first.
          if (currentPayment.status === PaymentStatus.PAID) {
            if (currentPayment.booking) {
              return currentPayment.booking;
            }

            throw new ConflictException(
              'Payment is marked paid but its booking is missing.',
            );
          }

          if (
            currentPayment.status !== PaymentStatus.PENDING
          ) {
            throw new ConflictException(
              'Checkout is no longer awaiting payment.',
            );
          }

          const now = new Date();

          const holds = await tx.roomHold.findMany({
            where: {
              checkoutId: dto.checkoutId,
              userId,
              status: RoomHoldStatus.ACTIVE,
              expiresAt: { gt: now },
            },
            include: {
              room: true,
            },
          });

          if (holds.length === 0) {
            throw new ConflictException(
              'Room holds have expired or been released. Payment needs reconciliation.',
            );
          }

          const firstHold = holds[0];

          // All rooms in one checkout must belong to one hotel
          // and use the same check-in/check-out dates.
          const sameStay = holds.every(
            (hold) =>
              hold.room.hotelId === firstHold.room.hotelId &&
              hold.checkIn.getTime() ===
                firstHold.checkIn.getTime() &&
              hold.checkOut.getTime() ===
                firstHold.checkOut.getTime(),
          );

          if (!sameStay) {
            throw new ConflictException(
              'The held rooms do not match a single stay.',
            );
          }

          const nights = Math.round(
            (firstHold.checkOut.getTime() -
              firstHold.checkIn.getTime()) /
              86400000,
          );

          const heldTotal = holds.reduce(
            (total, hold) =>
              total.add(
                new Prisma.Decimal(
                  hold.room.pricePerNight.toString(),
                ).mul(nights),
              ),
            new Prisma.Decimal(0),
          );

          if (!heldTotal.equals(currentPayment.amount)) {
            throw new ConflictException(
              'The held-room total does not match the payment record.',
            );
          }

          // Create one booking with all selected rooms.
          const booking = await tx.booking.create({
            data: {
              userId,
              paymentId: currentPayment.id,
              checkIn: firstHold.checkIn,
              checkOut: firstHold.checkOut,
              guestCount: 1,
              roomCount: holds.length,
              totalAmount: currentPayment.amount,
              status: BookingStatus.CONFIRMED,
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

          // Save the captured payment against the checkout.
          await tx.payment.update({
            where: {
              id: currentPayment.id,
            },
            data: {
              status: PaymentStatus.PAID,
              razorpayPaymentId:
                dto.razorpay_payment_id,
            },
          });

          // The booking now owns these rooms.
          await tx.roomHold.updateMany({
            where: {
              checkoutId: dto.checkoutId,
              userId,
              status: RoomHoldStatus.ACTIVE,
            },
            data: {
              status: RoomHoldStatus.CONFIRMED,
            },
          });

          return booking;
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      // If a concurrent retry created the booking first,
      // return that booking rather than creating another.
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2034')
      ) {
        const existingPayment =
          await this.prisma.payment.findUnique({
            where: {
              checkoutId: dto.checkoutId,
            },
            include: {
              booking: true,
            },
          });

        if (
          existingPayment?.status === PaymentStatus.PAID &&
          existingPayment.booking
        ) {
          return existingPayment.booking;
        }

        throw new ConflictException(
          'Payment verification conflicted with another request. Please retry verification.',
        );
      }

      throw error;
    }
  }


  async findMyBookings(userId: number) {
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
}
