import React, { useEffect, useMemo, useState } from "react";
import ScrollArea from "../../components/ui/scroll-area";
import AttendanceOvertimeTable from "../../components/blocs/Attendances/AttendanceOvertimeTable";
import Button from "../../components/ui/button";
import { useClientCompanyStore } from "../../store/clientCompanyStore";
import { useAttendanceStore } from "../../store/attendanceStore";
import { usePayrollPeriodStore } from "../../store/payrollPeriodStore";
import { useToastStore } from "../../store/toastStore";
import { recalculateAttendanceOvertime } from "../../api/attendance";

const AttendanceOvertime = () => {
  const {
    clientCompanies,
    fetchClientCompanies,
  } = useClientCompanyStore();
  const {
    attendancesTable,
    tableLoading,
    tableError,
    fetchAttendancesTable,
  } = useAttendanceStore();
  const {
    periods,
    fetchPayrollPeriods,
    loading: periodsLoading,
  } = usePayrollPeriodStore();
  const addToast = useToastStore((s) => s.addToast);

  const now = useMemo(() => new Date(), []);
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [clientCompanyId, setClientCompanyId] =
    useState("");
  const [periodId, setPeriodId] = useState("");
  const [periodPriority, setPeriodPriority] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchClientCompanies();
    fetchPayrollPeriods();
  }, [fetchClientCompanies, fetchPayrollPeriods]);

  const availablePeriods = useMemo(() => {
    if (!clientCompanyId) return [];
    return periods.filter(
      (period) =>
        !period.isClosed &&
        (period.clientCompanyId === clientCompanyId ||
          !period.clientCompanyId)
    );
  }, [periods, clientCompanyId]);

  useEffect(() => {
    if (!periodPriority) return;
    if (availablePeriods.length === 0) {
      if (periodId) setPeriodId("");
      return;
    }
    const isValid = availablePeriods.some(
      (period) => period.id === periodId
    );
    if (!periodId || !isValid) {
      setPeriodId(availablePeriods[0].id);
    }
  }, [availablePeriods, periodPriority, periodId]);

  const buildParams = () => {
    const params = {
      ...(clientCompanyId && { clientCompanyId }),
    };
    if (periodPriority && periodId) {
      params.periodId = periodId;
    } else {
      params.month = Number(month);
      params.year = Number(year);
    }
    return params;
  };

  useEffect(() => {
    fetchAttendancesTable(buildParams());
  }, [
    fetchAttendancesTable,
    month,
    year,
    clientCompanyId,
    periodId,
    periodPriority,
  ]);

  const yearOptions = useMemo(() => {
    const baseYear = Number(currentYear);
    return Array.from({ length: 5 }, (_, index) =>
      String(baseYear - 2 + index)
    );
  }, [currentYear]);

  const monthOptions = [
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

  const formatTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDisplayStatus = (row) => {
    if (row.attendanceStatus === "ABSENT") return "ABSENT";
    if (row.lateStatus === "LATE") return "LATE";
    return "PRESENT";
  };

  const getStatusLabel = (status) => {
    if (status === "ABSENT") return "Absent";
    if (status === "LATE") return "En retard";
    return "Present";
  };

  const getPeriodLabel = () => {
    if (periodPriority && periodId) {
      const period = periods.find(
        (item) => item.id === periodId
      );
      if (period) {
        return `du ${formatDate(
          period.startDate
        )} au ${formatDate(period.endDate)}`;
      }
    }

    if (month && year) {
      const start = new Date(
        Number(year),
        Number(month) - 1,
        1
      );
      const end = new Date(
        Number(year),
        Number(month),
        0
      );
      return `du ${formatDate(start)} au ${formatDate(end)}`;
    }

    return "-";
  };

  const sanitizeSheetName = (value) => {
    const cleaned = String(value || "Employe")
      .replace(/[\\/?*\[\]:]/g, " ")
      .trim();
    return (cleaned || "Employe").slice(0, 31);
  };

  const filteredAttendances = useMemo(() => {
    if (!searchTerm) return attendancesTable;
    const term = searchTerm.toLowerCase();
    return attendancesTable.filter((row) =>
      row.employee?.name?.toLowerCase().includes(term)
    );
  }, [attendancesTable, searchTerm]);

  const overtimeSummary = useMemo(() => {
    const byEmployee = new Map();
    const byRate = {
      "1.3": 0,
      "1.6": 0,
      "2.0": 0,
    };
    let totalOvertime = 0;
    let totalNormal = 0;
    let totalWeighted = 0;

    filteredAttendances.forEach((row) => {
      const overtimeHours = Number(row.overtimeHours) || 0;
      const normalHours = Number(row.normalHours) || 0;
      const rate = Number(row.overtimeRate) || 0;
      const rateKey = rate ? rate.toFixed(1) : null;

      totalOvertime += overtimeHours;
      totalNormal += normalHours;
      totalWeighted += overtimeHours * rate;

      if (rateKey && byRate[rateKey] !== undefined) {
        byRate[rateKey] += overtimeHours;
      }

      const employeeId = row.employee?.id || row.employee?.name;
      if (!employeeId) return;
      if (!byEmployee.has(employeeId)) {
        byEmployee.set(employeeId, {
          id: employeeId,
          name: row.employee?.name || "-",
          company: row.clientCompany?.companyName || "-",
          overtimeHours: 0,
          overtimeValue: 0,
        });
      }
      const entry = byEmployee.get(employeeId);
      entry.overtimeHours += overtimeHours;
      entry.overtimeValue += overtimeHours * rate;
    });

    return {
      totalOvertime,
      totalNormal,
      totalWeighted,
      byRate,
      employees: Array.from(byEmployee.values()).sort(
        (a, b) => b.overtimeHours - a.overtimeHours
      ),
    };
  }, [filteredAttendances]);

  const formatNumber = (value) =>
    Number(value || 0).toFixed(2);

  const formatRateHours = (rateKey) =>
    `${formatNumber(overtimeSummary.byRate[rateKey])} h`;

  const handleRecalculate = async () => {
    try {
      setSaving(true);
      const payload = {
        ...(clientCompanyId && { clientCompanyId }),
      };
      if (periodPriority && periodId) {
        payload.periodId = periodId;
      } else {
        payload.month = month;
        payload.year = year;
      }
      await recalculateAttendanceOvertime(payload);
      addToast({
        type: "success",
        message: "Recalcul termine",
      });
      fetchAttendancesTable(buildParams());
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de recalculer",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!clientCompanyId) {
      addToast({
        type: "error",
        message: "Selectionnez une entreprise",
      });
      return;
    }

    if (periodPriority && !periodId) {
      addToast({
        type: "error",
        message: "Selectionnez une periode payroll",
      });
      return;
    }

    if (!periodPriority && (!month || !year)) {
      addToast({
        type: "error",
        message: "Selectionnez une periode",
      });
      return;
    }

    if (filteredAttendances.length === 0) {
      addToast({
        type: "error",
        message: "Aucune donnee a exporter",
      });
      return;
    }

    try {
      setExporting(true);
      const periodLabel = getPeriodLabel();
      const companyName =
        clientCompanies.find((item) => item.id === clientCompanyId)
          ?.companyName || "-";
      const toFixedNumber = (value) =>
        Number(Number(value || 0).toFixed(2));
      const totals = {
        "1.3": 0,
        "1.6": 0,
        "2.0": 0,
      };

      const grouped = new Map();
      filteredAttendances.forEach((row) => {
        const employeeName = row.employee?.name || "Employe";
        const key = row.employee?.id || employeeName;
        const rate = Number(row.overtimeRate) || 0;
        const overtimeHours = Number(row.overtimeHours) || 0;
        const rateKey = rate ? rate.toFixed(1) : "";

        const hours13 = rateKey === "1.3" ? overtimeHours : 0;
        const hours16 = rateKey === "1.6" ? overtimeHours : 0;
        const hours20 = rateKey === "2.0" ? overtimeHours : 0;

        totals["1.3"] += hours13;
        totals["1.6"] += hours16;
        totals["2.0"] += hours20;

        const rowData = [
          formatDate(row.date || row.checkIn),
          employeeName,
          formatTime(row.checkIn),
          formatTime(row.checkOut),
          getStatusLabel(getDisplayStatus(row)),
          periodLabel,
          toFixedNumber(hours13),
          toFixedNumber(hours16),
          toFixedNumber(hours20),
        ];

        if (!grouped.has(key)) {
          grouped.set(key, {
            name: employeeName,
            rows: [],
            totals: { "1.3": 0, "1.6": 0, "2.0": 0 },
          });
        }
        const entry = grouped.get(key);
        entry.rows.push(rowData);
        entry.totals["1.3"] += hours13;
        entry.totals["1.6"] += hours16;
        entry.totals["2.0"] += hours20;
      });

      const headers = [
        "Date",
        "Employe",
        "Heure entree",
        "Heure sortie",
        "Statut",
        "Periode",
        "1.3",
        "1.6",
        "2.0",
      ];

      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const usedNames = new Set();

      const entries = Array.from(grouped.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      entries.forEach((entry) => {
        const sheetData = [headers, ...entry.rows];
        sheetData.push([
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          toFixedNumber(entry.totals["1.3"]),
          toFixedNumber(entry.totals["1.6"]),
          toFixedNumber(entry.totals["2.0"]),
        ]);

        let sheetName = sanitizeSheetName(entry.name);
        let suffix = 1;
        while (usedNames.has(sheetName)) {
          const base = sanitizeSheetName(entry.name);
          const next = `${base}_${suffix}`;
          sheetName = next.slice(0, 31);
          suffix += 1;
        }
        usedNames.add(sheetName);

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      const totalOvertime =
        totals["1.3"] + totals["1.6"] + totals["2.0"];
      const totalsSheet = XLSX.utils.aoa_to_sheet([
        ["Entreprise", companyName],
        ["Periode", periodLabel],
        [],
        ["Total 1.3", "Total 1.6", "Total 2.0", "Total heures sup"],
        [
          toFixedNumber(totals["1.3"]),
          toFixedNumber(totals["1.6"]),
          toFixedNumber(totals["2.0"]),
          toFixedNumber(totalOvertime),
        ],
      ]);
      XLSX.utils.book_append_sheet(workbook, totalsSheet, "TOTALS");

      XLSX.writeFile(
        workbook,
        "attendance_overtime.xlsx"
      );

      addToast({
        type: "success",
        message: "Export Excel termine",
      });
    } catch (error) {
      addToast({
        type: "error",
        message: "Impossible d'exporter",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="h-full flex flex-col gap-4 p-2">
      <div className="bg-white border rounded-2xl p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold text-neutral-800">
              Calcul des heures supplementaires
            </p>
            <p className="text-[11px] text-neutral-400">
              Selectionnez une periode
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <select
              className="border rounded-lg px-3 py-2 text-[11px]"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg px-3 py-2 text-[11px]"
              value={year}
              onChange={(event) => setYear(event.target.value)}
            >
              {yearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg px-3 py-2 text-[11px]"
              value={clientCompanyId}
              onChange={(event) =>
                setClientCompanyId(event.target.value)
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
              className="border rounded-lg px-3 py-2 text-[11px]"
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
              disabled={periodsLoading || !clientCompanyId}
            >
              <option value="">Periode payroll</option>
              {availablePeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label} ({formatDate(period.startDate)} -{" "}
                  {formatDate(period.endDate)})
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-[11px] text-neutral-600">
              <input
                type="checkbox"
                checked={periodPriority}
                onChange={(event) =>
                  setPeriodPriority(event.target.checked)
                }
              />
              Priorite periode payroll
            </label>

            <input
              type="text"
              placeholder="Filtrer par employe"
              className="border rounded-lg px-3 py-2 text-[11px]"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <Button
              buttonStyle={false}
              className="px-4 py-2 rounded-lg text-[11px]"
              onClick={handleExport}
              loading={exporting}
            >
              Exporter Excel
            </Button>

            <Button
              buttonStyle
              className="px-4 py-2 rounded-lg text-[11px]"
              onClick={handleRecalculate}
              loading={saving}
            >
              Recalculer et enregistrer
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
          <span className="px-2.5 py-1 rounded-full bg-neutral-100">
            Total heures normales:{" "}
            <span className="font-semibold text-neutral-800">
              {formatNumber(overtimeSummary.totalNormal)} h
            </span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-100">
            Total heures sup:{" "}
            <span className="font-semibold text-neutral-800">
              {formatNumber(overtimeSummary.totalOvertime)} h
            </span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-100">
            Heures sup ponderees:{" "}
            <span className="font-semibold text-neutral-800">
              {formatNumber(overtimeSummary.totalWeighted)}
            </span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-100">
            1.3:{" "}
            <span className="font-semibold text-neutral-800">
              {formatRateHours("1.3")}
            </span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-100">
            1.6:{" "}
            <span className="font-semibold text-neutral-800">
              {formatRateHours("1.6")}
            </span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-100">
            2.0:{" "}
            <span className="font-semibold text-neutral-800">
              {formatRateHours("2.0")}
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-2xl p-4 flex flex-col h-[360px] sm:h-[420px]">
          <p className="text-[13px] font-semibold text-neutral-800 mb-3">
            Heures supplementaires par agent
          </p>
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-[11px]">
              <thead className="bg-neutral-50 text-neutral-500 border-b">
                <tr>
                  <th className="px-3 py-3 text-left">Agent</th>
                  <th className="px-3 py-3 text-left">Entreprise</th>
                  <th className="px-3 py-3 text-left">Heures sup</th>
                  <th className="px-3 py-3 text-left">Somme sup</th>
                </tr>
              </thead>
              <tbody>
                {overtimeSummary.employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t hover:bg-neutral-50"
                  >
                  <td className="px-3 py-3 text-neutral-700 font-medium text-[11px]">
                    {employee.name}
                  </td>
                    <td className="px-3 py-3 text-neutral-600">
                      {employee.company}
                    </td>
                    <td className="px-3 py-3 text-neutral-700">
                      {formatNumber(employee.overtimeHours)} h
                    </td>
                    <td className="px-3 py-3 text-neutral-700">
                      {formatNumber(employee.overtimeValue)}
                    </td>
                  </tr>
                ))}

                {overtimeSummary.employees.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-3 py-6 text-center text-neutral-400 text-[11px]"
                    >
                      Aucun pointage
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4 flex flex-col h-[360px] sm:h-[420px]">
          <p className="text-[13px] font-semibold text-neutral-800 mb-3">
            Toutes les heures supplementaires
          </p>
          <div className="flex-1 min-h-0">
            <AttendanceOvertimeTable
              rows={filteredAttendances}
              loading={tableLoading}
              error={tableError}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttendanceOvertime;
