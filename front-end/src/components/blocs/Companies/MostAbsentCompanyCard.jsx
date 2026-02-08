import React, { useEffect, useMemo } from "react";
import { useAttendanceStore } from "../../../store/attendanceStore";
import { Building2 } from "lucide-react";

const MostAbsentCompanyCard = () => {
  const attendances = useAttendanceStore((s) => s.attendances);
  const fetchAttendances = useAttendanceStore((s) => s.fetchAttendances);
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

      if (date.getMonth() !== month || date.getFullYear() !== year) {
        return;
      }

      const company = att.employee.clientCompany;

      if (!companyMap[company.id]) {
        companyMap[company.id] = {
          company,
          count: 0,
        };
      }

      companyMap[company.id].count++;
    });

    return Object.values(companyMap).sort((a, b) => b.count - a.count)[0];
  }, [attendances]);

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-3 h-full min-h-[140px] flex flex-col overflow-hidden">
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    );
  }

  if (!mostAbsentCompany) {
    return (
      <div className="bg-white border rounded-2xl p-3 h-full min-h-[140px] flex flex-col overflow-hidden">
        <p className="text-sm text-neutral-500">
          Aucune absence ce mois
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-3 h-full min-h-[140px] flex flex-col gap-2 overflow-hidden min-w-0">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 flex items-center justify-center bg-rose-100 text-rose-600 rounded-md">
          <Building2 size={16} />
        </div>
        <span className="text-[11px] text-neutral-400">Ce mois</span>
      </div>

      <p className="text-[11px] text-neutral-500 leading-tight">
        Entreprise avec le plus d'absences
      </p>

      <p
        className="text-base font-semibold text-neutral-900 leading-tight truncate"
        title={mostAbsentCompany.company.companyName}
      >
        {mostAbsentCompany.company.companyName}
      </p>

      <p className="text-[11px] text-rose-600 font-medium">
        {mostAbsentCompany.count} absence(s)
      </p>

      <p
        className="text-[11px] text-neutral-400 truncate"
        title={mostAbsentCompany.company.activitySector}
      >
        Secteur : {mostAbsentCompany.company.activitySector}
      </p>
    </div>
  );
};

export default MostAbsentCompanyCard;
