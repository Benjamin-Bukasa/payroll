import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { useAuthStore } from "./store/authStore";
import "./index.css"

function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe(); // CRUCIAL : restaure la session depuis les cookies
  }, [fetchMe]);

  return <RouterProvider router={router} />;
}

export default App;
