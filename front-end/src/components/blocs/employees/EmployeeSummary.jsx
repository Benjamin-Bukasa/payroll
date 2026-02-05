import React, { useEffect, useMemo } from "react";
import { useEmployeeStore } from "../../../store/employeeStore";
import { Users, UserCheck, UserMinus, UserX } from "lucide-react";

const EmployeeSummary = () => {
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

    let total = 0;
    let actif = 0;
    let inactif = 0;
    let suspendu = 0;

    employees.forEach((emp) => {
      const createdAt = new Date(emp.createdAt);

      if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
        total++;
        if (emp.status === "ACTIF") actif++;
        if (emp.status === "INACTIF") inactif++;
        if (emp.status === "SUSPENDU") suspendu++;
      }
    });

    return { total, actif, inactif, suspendu };
  }, [employees]);

  if (loading) {
    return (
      <p className="text-sm text-neutral-500">
        Chargement…
      </p>
    );
  }

  return (
    <div className="flex gap-4 w-full md:w-full">
      {/* TOTAL */}
      <div className="w-1/4 bg-white border rounded-lg p-4 flex flex-col gap-1">
        <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
          <Users />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.total}
        </p>
        <p className="text-sm text-neutral-500">
          Employés ce mois
        </p>
      </div>

      {/* ACTIFS */}
      <div className="w-1/4 bg-white border rounded-lg p-4 flex flex-col gap-1">
        <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-lg">
          <UserCheck />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.actif}
        </p>
        <p className="text-sm text-neutral-500">
          Actifs
        </p>
      </div>

      {/* INACTIFS */}
      <div className="w-1/4 bg-white border rounded-lg p-4 flex flex-col gap-1">
        <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-lg">
          <UserMinus />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.inactif}
        </p>
        <p className="text-sm text-neutral-500">
          Inactifs
        </p>
      </div>

      {/* SUSPENDUS */}
      <div className="w-1/4 bg-white border rounded-lg p-4 flex flex-col gap-1">
        <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-lg">
          <UserX />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.suspendu}
        </p>
        <p className="text-sm text-neutral-500">
          Suspendus
        </p>
      </div>
    </div>
  );
};

export default EmployeeSummary;
