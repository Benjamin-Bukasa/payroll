/*
  Warnings:

  - You are about to drop the column `status` on the `Payroll` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Payroll` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayrollValidationStatus" AS ENUM ('DRAFT', 'VALIDATED', 'CLOSED');

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "status",
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedById" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentStatus" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "pdfPath" TEXT,
ADD COLUMN     "totalDeductions" DOUBLE PRECISION,
ADD COLUMN     "totalEarnings" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedById" TEXT,
ADD COLUMN     "validationStatus" "PayrollValidationStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
