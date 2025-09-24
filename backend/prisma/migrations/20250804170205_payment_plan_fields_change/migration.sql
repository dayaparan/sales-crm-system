-- AlterTable
ALTER TABLE "payment_plans" ADD COLUMN     "discountPercentage" TEXT,
ADD COLUMN     "downPayment" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "guaranteedRoi" TEXT,
ADD COLUMN     "installment" TEXT,
ADD COLUMN     "modelType" TEXT,
ADD COLUMN     "specialCondition" TEXT;
