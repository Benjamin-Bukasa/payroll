-- AlterTable
ALTER TABLE "ClientCompany" ADD COLUMN     "activitySector" "ActivitySector" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "seal" TEXT;
