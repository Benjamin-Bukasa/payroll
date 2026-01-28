import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, checkingAuth } = useAuthStore();

  if (checkingAuth) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
