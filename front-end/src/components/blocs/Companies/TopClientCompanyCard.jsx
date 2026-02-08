import React, { useEffect, useMemo } from "react";
import { useEmployeeStore } from "../../../store/employeeStore";
import { Building2 } from "lucide-react";

const TopClientCompanyCard = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const loading = useEmployeeStore((s) => s.loading);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const topCompany = useMemo(() => {
    const map = {};

    employees.forEach((emp) => {
      const company = emp.clientCompany;
      if (!company) return;

      if (!map[company.id]) {
        map[company.id] = {
          company,
          count: 0,
        };
      }
      map[company.id].count++;
    });

    return Object.values(map).sort((a, b) => b.count - a.count)[0];
  }, [employees]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-3 h-full min-h-[140px] flex flex-col overflow-hidden">
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    );
  }

  if (!topCompany) {
    return (
      <div className="bg-white border rounded-2xl p-3 h-full min-h-[140px] flex flex-col overflow-hidden">
        <p className="text-sm text-neutral-500">
          Aucune entreprise trouvée
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-3 h-full min-h-[140px] flex flex-col gap-2 overflow-hidden min-w-0">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-md">
          <Building2 size={16} />
        </div>
        <span className="text-[11px] text-neutral-400">Ce mois</span>
      </div>

      <p className="text-[11px] text-neutral-500 leading-tight">
        Entreprise avec le plus d'agents
      </p>

      <p
        className="text-base font-semibold text-neutral-900 leading-tight truncate"
        title={topCompany.company.companyName}
      >
        {topCompany.company.companyName}
      </p>

      <p className="text-[11px] text-emerald-600 font-medium">
        {topCompany.count} employé(s)
      </p>

      <p
        className="text-[11px] text-neutral-400 truncate"
        title={topCompany.company.activitySector}
      >
        {topCompany.company.activitySector}
      </p>
    </div>
  );
};

export default TopClientCompanyCard;
