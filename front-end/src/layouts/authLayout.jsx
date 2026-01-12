import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="font-poppins min-h-screen flex items-center justify-center bg-gray-100">
      <Outlet />
    </div>
  );
}
