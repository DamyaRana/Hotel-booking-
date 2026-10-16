/*
  Warnings:

  - You are about to drop the column `capacity` on the `Room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomHoldStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'RELEASED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "capacity";

-- CreateTable
CREATE TABLE "RoomHold" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "RoomHoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomHold_roomId_checkIn_checkOut_idx" ON "RoomHold"("roomId", "checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "RoomHold_expiresAt_idx" ON "RoomHold"("expiresAt");

-- AddForeignKey
ALTER TABLE "RoomHold" ADD CONSTRAINT "RoomHold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomHold" ADD CONSTRAINT "RoomHold_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
