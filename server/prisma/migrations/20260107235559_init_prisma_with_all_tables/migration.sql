/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RefreshToken` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `adress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `contractType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateEnd` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateHire` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `User` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK', 'OTHER');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "LateStatus" AS ENUM ('ON_TIME', 'LATE');

-- CreateEnum
CREATE TYPE "ActivitySector" AS ENUM ('GENERAL', 'MINING', 'AGRICULTURE', 'INDUSTRY', 'SERVICES', 'CONSTRUCTION', 'TRANSPORT', 'ENERGY');

-- CreateEnum
CREATE TYPE "Devise" AS ENUM ('CDF', 'EUR', 'USD');

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "createdAt",
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "adress",
DROP COLUMN "contractType",
DROP COLUMN "dateBirth",
DROP COLUMN "dateEnd",
DROP COLUMN "dateHire",
DROP COLUMN "department",
DROP COLUMN "gender",
DROP COLUMN "googleId",
DROP COLUMN "position",
DROP COLUMN "resetPasswordExpires",
DROP COLUMN "resetPasswordToken",
DROP COLUMN "username",
DROP COLUMN "verificationToken",
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT true,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "idNat" TEXT,
    "rccm" TEXT,
    "numImpot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "trialNotified14" BOOLEAN NOT NULL DEFAULT false,
    "trialNotified7" BOOLEAN NOT NULL DEFAULT false,
    "trialNotified0" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCompany" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "idNat" TEXT,
    "rccm" TEXT,
    "numImpot" TEXT,
    "companyId" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientCompanySchedule" (
    "id" TEXT NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT false,
    "sunday" BOOLEAN NOT NULL DEFAULT false,
    "clientCompanyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientCompanySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "placeofbirth" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "civilStatus" TEXT NOT NULL,
    "children" INTEGER NOT NULL,
    "adress" TEXT,
    "familyContactName" TEXT,
    "familyContactRelation" TEXT,
    "familyContactPhone" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "smigId" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSchedule" (
    "id" TEXT NOT NULL,
    "startDay" "WeekDay" NOT NULL,
    "endDay" "WeekDay" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "startedDay" "WeekDay" NOT NULL,
    "endedDay" "WeekDay",
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "workedHours" DOUBLE PRECISION,
    "normalHours" DOUBLE PRECISION,
    "overtimeHours" DOUBLE PRECISION,
    "overtimeRate" DOUBLE PRECISION,
    "attendanceStatus" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "lateStatus" "LateStatus" NOT NULL DEFAULT 'ON_TIME',
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "status" "PayrollStatus" NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTax" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payrollId" TEXT NOT NULL,

    CONSTRAINT "PayrollTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HRSettings" (
    "id" TEXT NOT NULL,
    "lateToleranceMinutes" INTEGER NOT NULL DEFAULT 15,
    "absenceAfterMinutes" INTEGER NOT NULL DEFAULT 120,
    "nightStartHour" INTEGER NOT NULL DEFAULT 22,
    "nightEndHour" INTEGER NOT NULL DEFAULT 6,
    "overtimeDayRate" DOUBLE PRECISION NOT NULL DEFAULT 1.3,
    "overtimeNightRate" DOUBLE PRECISION NOT NULL DEFAULT 1.6,
    "overtimeHolidayRate" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "clientCompanyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HRSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Smig" (
    "id" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "echelon" TEXT NOT NULL,
    "tension" TEXT NOT NULL,
    "colonne" TEXT NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Smig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollSetting" (
    "id" TEXT NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "housingRate" DOUBLE PRECISION NOT NULL DEFAULT 0.30,
    "maxChildrenAllowance" INTEGER NOT NULL DEFAULT 9,
    "familyAllowanceDivider" INTEGER NOT NULL DEFAULT 27,
    "taxiFare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxiCoursesPerDay" INTEGER NOT NULL DEFAULT 6,
    "medicalAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cnssQPORate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "iprReductionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "iprMaxChildren" INTEGER NOT NULL DEFAULT 9,
    "defaultUnionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allowSalaryAdvance" BOOLEAN NOT NULL DEFAULT true,
    "isMiningSector" BOOLEAN NOT NULL DEFAULT false,
    "miningSectorMaxYears" INTEGER NOT NULL DEFAULT 11,
    "iereRate" DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    "iereMiningRate" DOUBLE PRECISION NOT NULL DEFAULT 0.125,
    "cnssRiskEmployerRate" DOUBLE PRECISION NOT NULL DEFAULT 0.015,
    "cnssRetirementRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "cnssFamilyRate" DOUBLE PRECISION NOT NULL DEFAULT 0.065,
    "onemRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0005,
    "inppRateSmall" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "inppRateMedium" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "inppRateLarge" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollHistory" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payrollId" TEXT NOT NULL,

    CONSTRAINT "PayrollHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientCompanySchedule_clientCompanyId_key" ON "ClientCompanySchedule"("clientCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSchedule_employeeId_startDay_startTime_key" ON "EmployeeSchedule"("employeeId", "startDay", "startTime");

-- CreateIndex
CREATE INDEX "Attendance_employeeId_startTime_idx" ON "Attendance"("employeeId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "HRSettings_clientCompanyId_key" ON "HRSettings"("clientCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "Smig_categorie_echelon_tension_colonne_key" ON "Smig"("categorie", "echelon", "tension", "colonne");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollSetting_clientCompanyId_key" ON "PayrollSetting"("clientCompanyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompany" ADD CONSTRAINT "ClientCompany_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientCompanySchedule" ADD CONSTRAINT "ClientCompanySchedule_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_smigId_fkey" FOREIGN KEY ("smigId") REFERENCES "Smig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "PayrollPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTax" ADD CONSTRAINT "PayrollTax_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HRSettings" ADD CONSTRAINT "HRSettings_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollSetting" ADD CONSTRAINT "PayrollSetting_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "ClientCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollHistory" ADD CONSTRAINT "PayrollHistory_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
