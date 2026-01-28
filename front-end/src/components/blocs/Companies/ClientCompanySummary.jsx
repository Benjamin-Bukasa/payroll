import { useEffect, useMemo } from "react";
import { Building2, Users, FolderOpen, AlertTriangle } from "lucide-react";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";

const ClientCompanySummary = () => {
  const clientCompanies =
    useClientCompanyStore((s) => s.clientCompanies);
  const fetchClientCompanies =
    useClientCompanyStore((s) => s.fetchClientCompanies);
  const loading =
    useClientCompanyStore((s) => s.loading);

  useEffect(() => {
    fetchClientCompanies();
  }, [fetchClientCompanies]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    let createdThisMonth = 0;
    let withEmployees = 0;
    let withoutEmployees = 0;
    let generalSector = 0;

    clientCompanies.forEach((c) => {
      const createdAt = new Date(c.createdAt);

      if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
        createdThisMonth++;
      }

      if (c._count?.employees > 0) {
        withEmployees++;
      } else {
        withoutEmployees++;
      }

      if (c.activitySector === "GENERAL") {
        generalSector++;
      }
    });

    return {
      createdThisMonth,
      withEmployees,
      withoutEmployees,
      generalSector,
    };
  }, [clientCompanies]);

  if (loading) {
    return (
      <p className="text-sm text-neutral-500">
        Chargement…
      </p>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CRÉÉES CE MOIS */}
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-2">
        <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
          <Building2 />
        </div>
        <p className="text-xl font-semibold">
          {stats.createdThisMonth}
        </p>
        <p className="text-sm text-neutral-500">
          Entreprises créées ce mois
        </p>
      </div>

      {/* AVEC EMPLOYÉS */}
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-2">
        <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
          <Users />
        </div>
        <p className="text-xl font-semibold">
          {stats.withEmployees}
        </p>
        <p className="text-sm text-neutral-500">
          Avec employés
        </p>
      </div>

      {/* SANS EMPLOYÉS */}
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-2">
        <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-lg">
          <AlertTriangle />
        </div>
        <p className="text-xl font-semibold">
          {stats.withoutEmployees}
        </p>
        <p className="text-sm text-neutral-500">
          Sans employés
        </p>
      </div>

      {/* SECTEUR GÉNÉRAL */}
      <div className="bg-white border rounded-lg p-4 flex flex-col gap-2">
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg">
          <FolderOpen />
        </div>
        <p className="text-xl font-semibold">
          {stats.generalSector}
        </p>
        <p className="text-sm text-neutral-500">
          Secteur général
        </p>
      </div>
    </div>
  );
};

export default ClientCompanySummary;
