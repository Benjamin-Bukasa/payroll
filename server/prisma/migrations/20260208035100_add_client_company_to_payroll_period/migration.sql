-- AlterTable
ALTER TABLE "PayrollPeriod" ADD COLUMN     "clientCompanyId" TEXT;

-- CreateIndex
CREATE INDEX "PayrollPeriod_clientCompanyId_startDate_idx" ON "PayrollPeriod"("clientCompanyId", "startDate");

-- AddForeignKey
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
