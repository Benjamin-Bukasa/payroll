import React, { useEffect, useMemo } from "react";
import { useEmployeeStore } from "../../../store/employeeStore";
import { UserX, LogOutIcon, Users } from "lucide-react";

const HomeSummary = () => {
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const loading = useEmployeeStore((s) => s.loading);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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

    let actif = 0;
    let inactif = 0;
    let suspendu = 0;

    employees.forEach((emp) => {
      const createdAt = new Date(emp.createdAt);

      if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
        if (emp.status === "ACTIF") actif++;
        if (emp.status === "INACTIF") inactif++;
        if (emp.status === "SUSPENDU") suspendu++;
      }
    });

    return {
      actif,
      inactif,
      suspendu,
      conge: 0,
    };
  }, [employees]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-5">
        <p className="text-sm text-neutral-500">
          Chargement...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-neutral-800">
            Résumé des effectifs
          </p>
          <p className="text-[10px] text-neutral-400">
            Mois en cours
          </p>
        </div>
        <span className="text-[10px] text-neutral-400">
          Actualisé
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 flex-1 min-h-0 auto-rows-fr">
        <div className="w-full flex flex-col gap-1 border rounded-lg bg-neutral-50 p-2 min-h-0 overflow-hidden">
          <div className="w-7 h-7 flex items-center justify-center text-green-600 bg-green-100 rounded-md">
            <Users size={14} />
          </div>
          <p className="text-base font-semibold text-neutral-900 leading-tight">
            {stats.actif}
          </p>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Actifs
          </p>
        </div>

        <div className="w-full flex flex-col gap-1 border rounded-lg bg-neutral-50 p-2 min-h-0 overflow-hidden">
          <div className="w-7 h-7 flex items-center justify-center text-yellow-600 bg-yellow-100 rounded-md">
            <Users size={14} />
          </div>
          <p className="text-base font-semibold text-neutral-900 leading-tight">
            {stats.inactif}
          </p>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Inactifs
          </p>
        </div>

        <div className="w-full flex flex-col gap-1 border rounded-lg bg-neutral-50 p-2 min-h-0 overflow-hidden">
          <div className="w-7 h-7 flex items-center justify-center text-red-600 bg-red-100 rounded-md">
            <UserX size={14} />
          </div>
          <p className="text-base font-semibold text-neutral-900 leading-tight">
            {stats.suspendu}
          </p>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Suspendus
          </p>
        </div>

        <div className="w-full flex flex-col gap-1 border rounded-lg bg-neutral-50 p-2 min-h-0 overflow-hidden">
          <div className="w-7 h-7 flex items-center justify-center text-blue-600 bg-blue-100 rounded-md">
            <LogOutIcon size={14} />
          </div>
          <p className="text-base font-semibold text-neutral-900 leading-tight">
            {stats.conge}
          </p>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Congés
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeSummary;
