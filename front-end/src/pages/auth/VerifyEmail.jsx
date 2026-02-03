import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/ui/button";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const hasVerified = useRef(false); // ✅ CLÉ DU FIX

  const [status, setStatus] = useState("loading");
  // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || hasVerified.current) return;

    hasVerified.current = true; // ⛔ empêche double appel

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
          "Échec de la vérification de l’email"
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl border p-6 text-center space-y-4">

        {status === "loading" && (
          <>
            <h2 className="text-lg font-semibold text-neutral-800">
              Vérification en cours…
            </h2>
            <p className="text-sm text-neutral-500">
              Merci de patienter quelques secondes
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-xl font-semibold text-green-600">
              Email vérifié avec succès 🎉
            </h2>
            <p className="text-sm text-neutral-600">
              Votre compte est maintenant actif.
            </p>

            <Link to="/login">
              <Button buttonStyle className="w-full mt-4 px-4 py-2 rounded-lg">
                Se connecter
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-semibold text-red-600">
              Vérification échouée ❌
            </h2>
            <p className="text-sm text-neutral-600">
              {message}
            </p>

            <Link to="/login">
              <Button className="w-full mt-4">
                Retour à la connexion
              </Button>
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
