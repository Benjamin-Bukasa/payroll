import React, { useEffect, useMemo } from "react";
import { useEmployeeStore } from "../../../store/employeeStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const EmployeesChart = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const loading = useEmployeeStore((s) => s.loading);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const data = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const stats = {
      ACTIF: 0,
      INACTIF: 0,
      SUSPENDU: 0,
    };

    employees.forEach((emp) => {
      const createdAt = new Date(emp.createdAt);
      if (createdAt <= endOfMonth && stats[emp.status] !== undefined) {
        stats[emp.status]++;
      }
    });

    return [
      {
        name: "Statuts",
        ACTIF: stats.ACTIF,
        INACTIF: stats.INACTIF,
        SUSPENDU: stats.SUSPENDU,
      },
    ];
  }, [employees]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-5">
        <p className="text-sm text-neutral-500">
          Chargement des statistiques...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">
            Statut des employés
          </h3>
          <p className="text-xs text-neutral-400">
            Mois en cours
          </p>
        </div>
        <span className="text-xs text-neutral-400">
          Comparaison
        </span>
      </div>

      <div className="mt-3 flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              stroke="#E5E7EB"
              strokeDasharray="2 6"
              vertical={false}
            />
            <XAxis dataKey="name" hide />
            <YAxis allowDecimals={false} />
            <Tooltip />

            <Bar
              dataKey="ACTIF"
              fill="#4F46E5"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="INACTIF"
              fill="#A5B4FC"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="SUSPENDU"
              fill="#D4D4D4"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-indigo-600" />
          <span className="text-neutral-700">Actifs</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-indigo-300" />
          <span className="text-neutral-700">Inactifs</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-neutral-300" />
          <span className="text-neutral-700">Suspendus</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeesChart;
