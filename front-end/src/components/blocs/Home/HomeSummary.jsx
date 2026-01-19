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

      // 👇 Employé existant durant le mois en cours
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
      conge: 0, // 🔜 à brancher avec Leave plus tard
    };
  }, [employees]);

  if (loading) {
    return (
      <p className="text-sm text-neutral-500">
        Chargement…
      </p>
    );
  }

  return (
    <div className="w-1/2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      {/* ACTIFS */}
      <div className="flex flex-col gap-1 bg-white border rounded-lg p-4">
        <div className="w-10 h-10 flex items-center justify-center text-green-600 bg-green-100 rounded-lg">
          <Users />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.actif}
        </p>
        <p className="text-sm text-neutral-500">
          Employés actifs ce mois
        </p>
      </div>

      {/* INACTIFS */}
      <div className="flex flex-col gap-1 bg-white border rounded-lg p-4">
        <div className="w-10 h-10 flex items-center justify-center text-yellow-600 bg-yellow-100 rounded-lg">
          <Users />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.inactif}
        </p>
        <p className="text-sm text-neutral-500">
          Employés inactifs ce mois
        </p>
      </div>

      {/* SUSPENDUS */}
      <div className="flex flex-col gap-1 bg-white border rounded-lg p-4">
        <div className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-100 rounded-lg">
          <UserX />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.suspendu}
        </p>
        <p className="text-sm text-neutral-500">
          Employés suspendus ce mois
        </p>
      </div>

      {/* CONGÉS (placeholder) */}
      <div className="flex flex-col gap-1 bg-white border rounded-lg p-4">
        <div className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-100 rounded-lg">
          <LogOutIcon />
        </div>
        <p className="text-xl font-semibold text-neutral-900">
          {stats.conge}
        </p>
        <p className="text-sm text-neutral-500">
          Employés en congé ce mois
        </p>
      </div>
    </div>
  );
};

export default HomeSummary;
