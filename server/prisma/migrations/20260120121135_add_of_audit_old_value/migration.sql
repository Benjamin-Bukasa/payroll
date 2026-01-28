-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "newValue" TEXT,
ADD COLUMN     "oldValue" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "devise" "Devise" NOT NULL DEFAULT 'CDF',
ADD COLUMN     "sector" "ActivitySector" NOT NULL DEFAULT 'GENERAL';
