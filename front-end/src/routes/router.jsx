import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/authLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoutes";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Home from "../pages/dashboard/Home";
import Employees from "../pages/dashboard/Employees";
import ClientCompanies from "../pages/dashboard/ClientCompanies";
import Attendance from "../pages/dashboard/Attendance";
import AttendanceOvertime from "../pages/dashboard/AttendanceOvertime";
import AttendanceDetail from "../pages/dashboard/AttendanceDetail";
import Payroll from "../pages/dashboard/Payroll";
import NotFound from "../pages/dashboard/NotFound";
import Settings from "../pages/dashboard/Settings";
import Leaves from './../pages/dashboard/Leaves';
import Report from "./../pages/dashboard/report";
import Notifications from './../pages/dashboard/Notifications';
import Folders from "./../pages/dashboard/Folders";
import Profile from './../pages/dashboard/Profile';
import GuestRoute from './GuestRoute';

import ClientCompany from "../components/blocs/Companies/ClientCompany";

// import Settings from './../pages/dashboard/Settings';
import SetProfile from './../components/Settings/SetProfile';
import CompanySettings from "../components/Settings/CompanySettings";
import EmployeeCreateForm from "../components/blocs/employees/EmployeeCreateForm";
import VerifyEmail from "../pages/auth/VerifyEmail";
import EmployeeDetails from './../components/blocs/employees/EmployeeDetails';
import EmployeeEditForm from './../components/blocs/employees/EmployeeEditForm';
import AttendanceForm from "../components/blocs/Attendances/AttendanceForm";
import CreateAttendance from "../pages/dashboard/CreateAttendance";
import SmigCreateForm from "../components/blocs/Attendances/smig/SmigCreateForm";
import PayrollSettings from "../components/Settings/PayrollSettings";
import PayrollSettingsVariables from "../components/Settings/PayrollSettingsVariables";
import PayrollPeriodSchedule from "../components/Settings/PayrollPeriodSchedule";


export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", 
        element:(
          <GuestRoute>
            <Login />
          </GuestRoute>
        )},
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/verify", element: <VerifyEmail/> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Home /> },
          { path: "/employees", element: <Employees /> },
          { path: "/employees/:id", element: <EmployeeDetails/>},
          { path: "/employees/edit/:id", element: <EmployeeEditForm/>},
          { path: "/createEmployee", element: <EmployeeCreateForm/>},
          { path: "/client-companies", element: <ClientCompanies />},
          { path: "/client-companies/:clientCompanyId", element: <ClientCompany />},
          { path: "/attendance", element: <Attendance /> },
          { path: "/attendance/overtime", element: <AttendanceOvertime /> },
          { path: "/attendance/:attendanceId", element: <AttendanceDetail /> },
          { path: "/createAttendance", element: <CreateAttendance/>},
          { path: "/leaves", element: <Leaves/> },
          { path: "/payroll", element: <Payroll /> },
          { path: "/report", element: <Report /> },
          { path: "/notifications", element: <Notifications/> },
          { 
            path: "/settings", 
            element: <Settings/>,
            children:[
              {index: true, element: <SetProfile/>},
              {element: <SetProfile/>, path: "profile"},
              {element: <SetProfile/>, path: "profile/:id"},
              {element: <CompanySettings/>, path: "company"},
              {element: <div>Billing Settings</div>, path: "billing"},
              {element: <div>Security Settings</div>, path: "security"},
              {element: <div>Notifications Settings</div>, path: "notifications"},
              {element: <PayrollSettings/>, path:"payroll",
                children:[
                  {index:true, element: <PayrollSettingsVariables/>},
                  {element: <PayrollSettingsVariables/>, path: "variables"},
                  {element: <div>Bulletin de paie</div>, path: "paybilling"},
                  {element: <div>Devises</div>, path: "currency"},
                  {element: <PayrollPeriodSchedule/>, path: "schedule"},
                  {element: <div>Taxes et Impôts</div>, path: "taxes"},
                  {element: <SmigCreateForm/>, path: "smig"},
                ]
              },

            ]
          },
          { path: "/folders", element: <Folders/> },
          { path: "/profile", element: <Profile/> },
        ],
      },
    ],
  },
  
  { path: "*", element: <NotFound /> },
]);
