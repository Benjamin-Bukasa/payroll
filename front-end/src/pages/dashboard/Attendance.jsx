import React, { useEffect, useMemo, useState } from "react";
import AttendancesSummary from "../../components/blocs/Attendances/AttendancesSummary";
import ScrollArea from "../../components/ui/scroll-area";
import AttendancesMonthlyCompiled from "../../components/blocs/Attendances/AttendancesMonthlyCompiled";
import AttendancesEmployeesOnLeave from "../../components/blocs/Attendances/AttendancesEmployeesOnLeave";
import AttendanceTable from "../../components/blocs/Attendances/AttendanceTable";
import Button from "../../components/ui/button";
import { useClientCompanyStore } from "../../store/clientCompanyStore";
import { usePayrollPeriodStore } from "../../store/payrollPeriodStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { useToastStore } from "../../store/toastStore";
import { downloadAttendanceTemplate } from "../../api/attendance";
import { useNavigate } from "react-router-dom";

function Attendance() {
  const navigate = useNavigate();
  const {
    clientCompanies,
    fetchClientCompanies,
  } = useClientCompanyStore();
  const {
    periods,
    fetchPayrollPeriods,
    loading: periodsLoading,
  } = usePayrollPeriodStore();
  const attendancesTable = useAttendanceStore(
    (s) => s.attendancesTable
  );
  const addToast = useToastStore((s) => s.addToast);

  const now = useMemo(() => new Date(), []);
  const currentYear = String(now.getFullYear());

  const [filters, setFilters] = useState({
    month: "",
    year: "",
    clientCompanyId: "",
    status: "",
    periodId: "",
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchClientCompanies();
    fetchPayrollPeriods();
  }, [fetchClientCompanies, fetchPayrollPeriods]);

  const yearOptions = useMemo(() => {
    const baseYear = Number(currentYear);
    return Array.from({ length: 5 }, (_, index) =>
      String(baseYear - 2 + index)
    );
  }, [currentYear]);

  const monthOptions = [
    { value: "", label: "Tous" },
    { value: "1", label: "Jan" },
    { value: "2", label: "Fev" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Avr" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juin" },
    { value: "7", label: "Juil" },
    { value: "8", label: "Aou" },
    { value: "9", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      await downloadAttendanceTemplate();
      addToast({
        type: "success",
        message: "Fichier Excel telecharge",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de telecharger le fichier",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      month: "",
      year: "",
      clientCompanyId: "",
      status: "",
      periodId: "",
    });
    setSortBy("date");
    setSortDir("desc");
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const totals = useMemo(() => {
    const totalNormal = attendancesTable.reduce(
      (sum, row) => sum + (Number(row.normalHours) || 0),
      0
    );
    const totalOvertime = attendancesTable.reduce(
      (sum, row) => sum + (Number(row.overtimeHours) || 0),
      0
    );
    return { totalNormal, totalOvertime };
  }, [attendancesTable]);

  return (
    <section className="h-full flex items-start justify-start gap-4 p-2">
      <div className="h-full flex flex-1 flex-col gap-2">
        <AttendancesSummary />
        <ScrollArea className={"h-full"}>
          <div className="h-full bg-white rounded-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 bg-white px-4 pt-4 pb-3 border-b shrink-0">
              <div className="flex flex-col md:flex-col md:items-start md:justify-start gap-3">
                <div className="w-full">
                  <p className="text-sm font-semibold text-neutral-800">
                    Liste de pointages
                  </p>

                </div>

                <div className="flex flex-wrap items-center gap-2">
                <select
                  className="border rounded-lg px-3 py-2 text-xs"
                  value={filters.month}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      month: event.target.value,
                      periodId: event.target.value ? "" : prev.periodId,
                      year:
                        event.target.value && !prev.year
                          ? currentYear
                          : prev.year,
                    }))
                  }
                >
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>

                <select
                  className="border rounded-lg px-3 py-2 text-xs"
                  value={filters.year}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      year: event.target.value,
                      periodId: event.target.value ? "" : prev.periodId,
                    }))
                  }
                >
                    <option value="">Toutes les annees</option>
                    {yearOptions.map((yearOption) => (
                      <option key={yearOption} value={yearOption}>
                        {yearOption}
                      </option>
                    ))}
                  </select>

                <select
                  className="border rounded-lg px-3 py-2 text-xs"
                  value={filters.clientCompanyId}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      clientCompanyId: event.target.value,
                    }))
                  }
                >
                  <option value="">Toutes les entreprises</option>
                  {clientCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                    </option>
                  ))}
                </select>

                <select
                  className="border rounded-lg px-3 py-2 text-xs"
                  value={filters.periodId}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      periodId: event.target.value,
                      month: event.target.value ? "" : prev.month,
                      year: event.target.value ? "" : prev.year,
                    }))
                  }
                  disabled={periodsLoading}
                >
                  <option value="">Periode payroll</option>
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.label} ({formatDate(period.startDate)} -{" "}
                      {formatDate(period.endDate)})
                    </option>
                  ))}
                </select>

                <select
                  className="border rounded-lg px-3 py-2 text-xs"
                  value={filters.status}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                  >
                    <option value="">Tous les statuts</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">En retard</option>
                  </select>

                  <select
                    className="border rounded-lg px-3 py-2 text-xs"
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                  >
                    <option value="date">Trier par date</option>
                    <option value="status">Trier par statut</option>
                  </select>

                  <select
                    className="border rounded-lg px-3 py-2 text-xs"
                    value={sortDir}
                    onChange={(event) =>
                      setSortDir(event.target.value)
                    }
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>

                <button
                  type="button"
                  className="border rounded-lg px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>

                <Button
                  buttonStyle
                  className="text-xs px-4 py-2 rounded-lg"
                  onClick={() => navigate("/attendance/overtime")}
                >
                  Calculer heures sup
                </Button>

                <Button
                  buttonStyle={false}
                  className="px-4 py-2 rounded-lg text-xs"
                  onClick={handleExport}
                  loading={exporting}
                  >
                    Exporter Excel
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 min-h-0">
              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-neutral-600">
                <span className="px-3 py-1 rounded-full bg-neutral-100">
                  Total heures normales:{" "}
                  <span className="font-semibold text-neutral-800">
                    {totals.totalNormal.toFixed(2)} h
                  </span>
                </span>
                <span className="px-3 py-1 rounded-full bg-neutral-100">
                  Total heures sup:{" "}
                  <span className="font-semibold text-neutral-800">
                    {totals.totalOvertime.toFixed(2)} h
                  </span>
                </span>
              </div>
              <AttendanceTable
                filters={filters}
                sortBy={sortBy}
                sortDir={sortDir}
                embedded
              />
            </div>
          </div>
        </ScrollArea>
      </div>
      <aside className="w-1/3 h-full p-1 flex flex-col items-start justify-start gap-2 rounded-lg">
        <AttendancesMonthlyCompiled />
        <AttendancesEmployeesOnLeave />
      </aside>
    </section>
  );
}

export default Attendance;
