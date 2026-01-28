import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { useAuthStore } from "./store/authStore";
import "./index.css";
import ToastContainer from './components/ui/toastContainer';

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);
  const checkingAuth = useAuthStore((s) => s.checkingAuth);

  useEffect(() => {
    fetchMe();

    const syncLogout = (event) => {
      if (event.key === "neopayroll-logout") {
        logout(true);
      }
    };

    window.addEventListener("storage", syncLogout);
    return () =>
      window.removeEventListener("storage", syncLogout);
  }, []);

  if (checkingAuth) return null;

  return (<><RouterProvider router={router} /><ToastContainer /></>)
  
  
}

export default App;
