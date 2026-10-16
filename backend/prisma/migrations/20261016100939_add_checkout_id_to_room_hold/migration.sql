/*
  Warnings:

  - Added the required column `checkoutId` to the `RoomHold` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoomHold" ADD COLUMN     "checkoutId" TEXT NOT NULL;
