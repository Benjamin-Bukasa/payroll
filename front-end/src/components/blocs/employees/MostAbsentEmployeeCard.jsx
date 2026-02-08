import React, { useEffect, useMemo } from "react";
import { useAttendanceStore } from "../../../store/attendanceStore";
import { CalendarX } from "lucide-react";

const MostAbsentEmployeeCard = () => {
  const attendances =
    useAttendanceStore((s) => s.attendances) || [];
  const fetchAttendances = useAttendanceStore(
    (s) => s.fetchAttendances
  );
  const loading = useAttendanceStore((s) => s.loading);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const mostAbsent = useMemo(() => {
    if (!Array.isArray(attendances)) return null;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const absenceMap = {};

    attendances.forEach((att) => {
      if (att.attendanceStatus !== "ABSENT") return;
      if (!att.employee) return;

      const date = new Date(att.startTime);

      if (date.getMonth() === month && date.getFullYear() === year) {
        const emp = att.employee;

        if (!absenceMap[emp.id]) {
          absenceMap[emp.id] = {
            employee: emp,
            count: 0,
          };
        }

        absenceMap[emp.id].count++;
      }
    });

    return Object.values(absenceMap).sort((a, b) => b.count - a.count)[0];
  }, [attendances]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-5">
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    );
  }

  if (!mostAbsent) {
    return (
      <div className="bg-white border rounded-2xl p-5">
        <p className="text-sm text-neutral-500">
          Aucune absence ce mois
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 flex items-center justify-center bg-rose-100 text-rose-600 rounded-lg">
          <CalendarX />
        </div>
        <span className="text-xs text-neutral-400">Ce mois</span>
      </div>

      <p className="text-xs text-neutral-500">
        Employé le plus absent
      </p>

      <p className="text-lg font-semibold text-neutral-900">
        {mostAbsent.employee.firstname} {mostAbsent.employee.lastname}
      </p>

      <p className="text-sm text-rose-600 font-medium">
        {mostAbsent.count} absence(s)
      </p>

      <p className="text-xs text-neutral-400">
        {mostAbsent.employee.department}
      </p>
    </div>
  );
};

export default MostAbsentEmployeeCard;
