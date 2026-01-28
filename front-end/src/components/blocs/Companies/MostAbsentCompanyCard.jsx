import React, { useEffect, useMemo } from "react";
import { useAttendanceStore } from "../../../store/attendanceStore";
import { Building2 } from "lucide-react";

const MostAbsentCompanyCard = () => {
  const attendances = useAttendanceStore((s) => s.attendances);
  const fetchAttendances = useAttendanceStore(
    (s) => s.fetchAttendances
  );
  const loading = useAttendanceStore((s) => s.loading);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const mostAbsentCompany = useMemo(() => {
    if (!Array.isArray(attendances)) return null;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const companyMap = {};

    attendances.forEach((att) => {
      if (att.attendanceStatus !== "ABSENT") return;
      if (!att.employee?.clientCompany) return;

      const date = new Date(att.startTime);

      if (
        date.getMonth() !== month ||
        date.getFullYear() !== year
      )
        return;

      const company = att.employee.clientCompany;

      if (!companyMap[company.id]) {
        companyMap[company.id] = {
          company,
          count: 0,
        };
      }

      companyMap[company.id].count++;
    });

    return Object.values(companyMap).sort(
      (a, b) => b.count - a.count
    )[0];
  }, [attendances]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-neutral-500">
          Chargement…
        </p>
      </div>
    );
  }

  if (!mostAbsentCompany) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-neutral-500">
          Aucune absence ce mois
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg">
        <Building2 />
      </div>

      <p className="text-sm text-neutral-500">
        Entreprise avec le plus d’absences (ce mois)
      </p>

      <p className="text-lg font-semibold text-neutral-900">
        {mostAbsentCompany.company.companyName}
      </p>

      <p className="text-sm text-red-600 font-medium">
        {mostAbsentCompany.count} absence(s)
      </p>

      <p className="text-xs text-neutral-400">
        Secteur :{" "}
        {mostAbsentCompany.company.activitySector}
      </p>
    </div>
  );
};

export default MostAbsentCompanyCard;
