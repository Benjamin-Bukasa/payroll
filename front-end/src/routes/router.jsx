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
import Payroll from "../pages/dashboard/Payroll";
import NotFound from "../pages/dashboard/NotFound";
import Settings from "../pages/dashboard/Settings";
import Leaves from './../pages/dashboard/Leaves';
import Report from "./../pages/dashboard/report";
import Notifications from './../pages/dashboard/Notifications';
import Folders from "./../pages/dashboard/Folders";
import Profile from './../pages/dashboard/Profile';
import GuestRoute from './GuestRoute';

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
          { path: "/client-companies", element: <ClientCompanies /> },
          { path: "/attendance", element: <Attendance /> },
          { path: "/leaves", element: <Leaves/> },
          { path: "/payroll", element: <Payroll /> },
          { path: "/report", element: <Report /> },
          { path: "/notifications", element: <Notifications/> },
          { path: "/settings", element: <Settings/> },
          { path: "/folders", element: <Folders/> },
          { path: "/profile", element: <Profile/> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
