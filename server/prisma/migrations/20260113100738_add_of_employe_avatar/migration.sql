-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIF';
