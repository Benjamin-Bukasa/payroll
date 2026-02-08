import express from 'express';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";
//load environment variables
dotenv.config();
import cors from 'cors';
import cookieParser from "cookie-parser"
import cron from "node-cron";

//import cron for trial period
import { trialReminderJob } from "./cron/trialreminder.js";

//import routes
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import clientCompanyRoutes from "./routes/clientCompanyRoutes.js"
import clientCompanyScheduleRoutes from "./routes/clientCompanyScheduleRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js"
import employeeAvatarRoutes from "./routes/employeeAvatarRoutes.js"
import employeeScheduleRoutes from "./routes/employeeScheduleRoutes.js"
import employeeAttendanceRoutes from "./routes/attendanceRoutes.js"
import smigRoutes from "./routes/smigRoutes.js"
import payrollSettingRoutes from"./routes/payrollSettingRoutes.js"
import payrollRoutes from "./routes/payrollRoutes.js"
import payrollValidationRoutes from "./routes/payrollValidationRoutes.js"
import payrollPeriodRoutes from "./routes/payrollPeriodRoutes.js"
import bootstrapRoutes from "./routes/bootstrapRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";



//initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



//middlewares
app.use(cors({
    origin: "http://localhost:5173", // FRONTEND
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

//use of cron reminde schedule
cron.schedule("0 8 * * *", trialReminderJob); // everyday at 08h


//routes
app.use("/payroll/api/admin", adminRoutes);
app.use("/payroll/api/auth", authRoutes)
app.use("/payroll/api/user", userRoutes);
app.use("/payroll/api/clientCompany", clientCompanyRoutes);
app.use("/payroll/api/clientCompanySchedule", clientCompanyScheduleRoutes);
app.use("/payroll/api/employee", employeeRoutes);
app.use("/payroll/api/employeeAvatar", employeeAvatarRoutes);
app.use("/payroll/api/employeeSchedule", employeeScheduleRoutes);
app.use("/payroll/api/employeeAttendance", employeeAttendanceRoutes);
app.use("/payroll/api/smig", smigRoutes);
app.use("/payroll/api/payrollSetting", payrollSettingRoutes);
app.use("/payroll/api/payroll", payrollRoutes);
app.use("/payroll/api/payrollValidation", payrollValidationRoutes);
app.use("/payroll/api/payrollPeriod", payrollPeriodRoutes);
app.use("/payroll/api/bootstrap", bootstrapRoutes);
app.use("/payroll/api/company", companyRoutes);





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
