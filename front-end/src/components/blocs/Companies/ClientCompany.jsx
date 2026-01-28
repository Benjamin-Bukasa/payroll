import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";

const ClientCompany = () => {
  const { clientCompanyId } = useParams();

  const {
    clientCompanies,
    fetchClientCompanies,
    loading,
    error,
  } = useClientCompanyStore();

  // 🔄 Charger les entreprises si pas encore fait
  useEffect(() => {
    if (!clientCompanies || clientCompanies.length === 0) {
      fetchClientCompanies();
    }
  }, [clientCompanies, fetchClientCompanies]);

  // 🔍 Trouver l’entreprise
  const company = useMemo(() => {
    return clientCompanies?.find(
      (cc) => cc.id === clientCompanyId
    );
  }, [clientCompanies, clientCompanyId]);

  /* ===============================
     STATES
  =============================== */
  if (loading) {
    return (
      <p className="text-sm text-neutral-500">
        Chargement de l’entreprise…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (!company) {
    return (
      <p className="text-sm text-neutral-500">
        Entreprise introuvable
      </p>
    );
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="bg-white border rounded-lg p-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">
          {company.companyName?.charAt(0)}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            {company.companyName}
          </h2>
          <p className="text-sm text-neutral-500">
            {company.activitySector}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <Info label="Email" value={company.email} />
        <Info label="Adresse" value={company.address} />
        <Info label="ID NAT" value={company.idNat} />
        <Info label="RCCM" value={company.rccm} />
        <Info label="Numéro d’impôt" value={company.numImpot} />
      </div>
    </div>
  );
};

/* ===============================
   SMALL INFO COMPONENT
=============================== */
const Info = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-neutral-500 text-xs">
      {label}
    </span>
    <span className="text-neutral-900 font-medium">
      {value || "-"}
    </span>
  </div>
);

export default ClientCompany;
