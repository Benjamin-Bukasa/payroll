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

    return Object.values(map).sort(
      (a, b) => b.count - a.count
    )[0];
  }, [employees]);

  if (loading) {
    return (
      <div className="h-full border rounded-lg p-4">
        <p className="text-sm text-neutral-500">
          Chargement…
        </p>
      </div>
    );
  }

  if (!topCompany) {
    return (
      <div className="h-full border rounded-lg p-4">
        <p className="text-sm text-neutral-500">
          Aucune entreprise trouvée
        </p>
      </div>
    );
  }

  return (
    <div className="border-b p-4 flex  gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg ">
        <Building2 />
      </div>
        <div className="flex flex-col gap-1">
            <p className="text-sm text-neutral-500">
                Entreprise avec le plus d’agents
            </p>
            <p className="text-lg font-semibold text-neutral-900">
                {topCompany.company.companyName}
            </p>

            <p className="text-sm text-green-600 font-medium">
                {topCompany.count} employé(s)
            </p>

            <p className="text-xs text-neutral-400">
                {topCompany.company.activitySector}
            </p>
        </div>
    </div>
  );
};

export default TopClientCompanyCard;
