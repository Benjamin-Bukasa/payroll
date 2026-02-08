import React, { useEffect, useMemo, useState } from "react";
import { usePayrollDashboardStore } from "../../store/payrollDashboardStore";
import { useClientCompanyStore } from "../../store/clientCompanyStore";

const DEFAULT_PAYMENT_STATUS = [
  { label: "Payés", value: 0, color: "#6366F1" },
  { label: "En attente", value: 0, color: "#F59E0B" },
  { label: "Suspendus", value: 0, color: "#FB7185" },
];

const DEFAULT_SALARY_TRACKER = [
  { day: "Lun", employee: 0, freelancer: 0 },
  { day: "Mar", employee: 0, freelancer: 0 },
  { day: "Mer", employee: 0, freelancer: 0 },
  { day: "Jeu", employee: 0, freelancer: 0 },
  { day: "Ven", employee: 0, freelancer: 0 },
  { day: "Sam", employee: 0, freelancer: 0 },
  { day: "Dim", employee: 0, freelancer: 0 },
];

const statusStyles = {
  "En cours": "bg-amber-50 text-amber-700",
  "En attente": "bg-orange-50 text-orange-700",
  "Complété": "bg-emerald-50 text-emerald-700",
  Suspendu: "bg-rose-50 text-rose-700",
};

const MONTH_OPTIONS = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Fév" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Avr" },
  { value: "5", label: "Mai" },
  { value: "6", label: "Juin" },
  { value: "7", label: "Juil" },
  { value: "8", label: "Aoû" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Déc" },
];

const buildLinePath = (points) => {
  if (!points || points.length === 0) {
    return "";
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  return points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 300;
      const y = 110 - ((value - min) / range) * 90;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

function Payroll() {
  const { data, loading, error, fetchDashboard } =
    usePayrollDashboardStore();
  const {
    clientCompanies,
    fetchClientCompanies,
  } = useClientCompanyStore();

  const now = useMemo(() => new Date(), []);
  const currentMonth = String(now.getMonth() + 1);
  const currentYear = String(now.getFullYear());

  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] =
    useState("");
  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth);
  const [selectedYear, setSelectedYear] =
    useState(currentYear);

  const yearOptions = useMemo(() => {
    const baseYear = Number(currentYear);
    return Array.from({ length: 5 }, (_, index) =>
      String(baseYear - 2 + index)
    );
  }, [currentYear]);

  useEffect(() => {
    fetchClientCompanies();
  }, [fetchClientCompanies]);

  useEffect(() => {
    const params = {};
    if (selectedCompanyId) {
      params.clientCompanyId = selectedCompanyId;
    }
    if (selectedMonth && selectedYear) {
      params.month = Number(selectedMonth);
      params.year = Number(selectedYear);
    }
    fetchDashboard(params);
  }, [
    fetchDashboard,
    selectedCompanyId,
    selectedMonth,
    selectedYear,
  ]);

  const handleResetFilters = () => {
    setSelectedCompanyId("");
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSearch("");
  };

  const paymentStatus =
    data?.paymentStatus?.length > 0
      ? data.paymentStatus
      : DEFAULT_PAYMENT_STATUS;
  const cashFlowDays = data?.cashFlowDays || [];
  const revenuePoints = data?.revenuePoints || [];
  const expensePoints = data?.expensePoints || [];
  const salaryTracker =
    data?.salaryTracker?.length > 0
      ? data.salaryTracker
      : DEFAULT_SALARY_TRACKER;
  const totalEmployees = data?.totalEmployees || 0;
  const totalAmount = data?.totalAmount || 0;
  const currency = data?.currency || "USD";

  const payrollRows = useMemo(() => {
    const rows = data?.payrollRows || [];
    if (!search) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) => {
      return (
        row.name?.toLowerCase().includes(term) ||
        row.email?.toLowerCase().includes(term) ||
        row.department?.toLowerCase().includes(term)
      );
    });
  }, [data, search]);

  const paymentTotal = paymentStatus.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const donutGradient =
    paymentTotal > 0
      ? `conic-gradient(${paymentStatus
          .map((item, index) => {
            const start = paymentStatus
              .slice(0, index)
              .reduce(
                (sum, current) => sum + current.value,
                0
              );
            const end = start + item.value;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(", ")})`
      : "conic-gradient(#E5E7EB 0% 100%)";

  const amountFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency,
      });
    } catch {
      return new Intl.NumberFormat("fr-FR");
    }
  }, [currency]);

  const formatAmount = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }
    return amountFormatter.format(value);
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

  const formatRange = (start, end) => {
    if (!start || !end) return "-";
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Statut des paiements
              </p>
              <p className="text-xs text-neutral-400">
                Vue globale
              </p>
            </div>
            <button className="border rounded-lg px-3 py-1 text-xs text-neutral-600">
              Aujourd'hui
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-40 h-40">
              <div
                className="w-full h-full rounded-full"
                style={{ background: donutGradient }}
              />
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold text-neutral-800">
                  {totalEmployees}+
                </p>
                <p className="text-xs text-neutral-400">
                  Employés
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {paymentStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="font-medium text-neutral-700">
                    {item.value}%
                  </span>
                  <span className="text-neutral-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-3 bg-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-indigo-600">
              +
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-semibold">
                +12% ce mois-ci
              </p>
              <p className="text-xs text-neutral-500">
                Optimisez pour améliorer le score
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Flux de trésorerie
              </p>
              <p className="text-xs text-neutral-400">
                Comparaison
              </p>
            </div>
            <button className="border rounded-lg px-3 py-1 text-xs text-neutral-600">
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-2 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Revenus
            </span>
            <span className="flex items-center gap-2 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Dépenses
            </span>
          </div>

          <div className="relative">
            <svg viewBox="0 0 300 120" className="w-full h-40">
              {[20, 50, 80, 110].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="300"
                  y1={y}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="4 4"
                />
              ))}
              <path
                d={buildLinePath(revenuePoints)}
                fill="none"
                stroke="#6366F1"
                strokeWidth="3"
              />
              <path
                d={buildLinePath(expensePoints)}
                fill="none"
                stroke="#FB7185"
                strokeWidth="3"
              />
            </svg>

            <div className="flex justify-between text-[10px] text-neutral-400 mt-2">
              {cashFlowDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Suivi salarial
              </p>
              <p className="text-xs text-neutral-400">
                Employés vs Freelance
              </p>
            </div>
            <button className="border rounded-lg px-3 py-1 text-xs text-neutral-600">
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-end gap-3 h-40">
            {salaryTracker.map((item) => (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex flex-col justify-end gap-1 h-full">
                  <div
                    className="w-full bg-emerald-500 rounded-md"
                    style={{ height: `${item.employee}%` }}
                  />
                  <div
                    className="w-full bg-emerald-100 rounded-md"
                    style={{ height: `${item.freelancer}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div>
              <p>Total du mois</p>
              <p className="text-lg font-semibold text-neutral-800">
                {formatAmount(totalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Employés
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-100 rounded-full" />
                Freelance
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Paie des agents
            </p>
            <p className="text-xs text-neutral-400">
              Mois en cours
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="border rounded-lg px-3 py-2 text-xs"
              value={selectedCompanyId}
              onChange={(event) =>
                setSelectedCompanyId(event.target.value)
              }
              disabled={loading}
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
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value)
              }
              disabled={loading}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              className="border rounded-lg px-3 py-2 text-xs"
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(event.target.value)
              }
              disabled={loading}
            >
              {yearOptions.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="border rounded-lg px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50"
              onClick={handleResetFilters}
              disabled={loading}
            >
              Reset
            </button>

            {loading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
                Chargement...
              </div>
            )}

            <input
              type="text"
              placeholder="Rechercher..."
              className="border rounded-lg px-3 py-2 text-xs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-3 py-3 text-left">
                  Nom complet & email
                </th>
                <th className="px-3 py-3 text-left">
                  Département
                </th>
                <th className="px-3 py-3 text-left">
                  Période
                </th>
                <th className="px-3 py-3 text-left">
                  Fin de période
                </th>
                <th className="px-3 py-3 text-left">
                  Salaire
                </th>
                <th className="px-3 py-3 text-left">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {payrollRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-neutral-50"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                        {row.name
                          ?.split(" ")
                          .map((part) => part[0])
                          .join("") || "--"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-700">
                          {row.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {row.email || "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-neutral-600">
                    {row.department || "-"}
                  </td>
                  <td className="px-3 py-4 text-neutral-600">
                    <p>
                      {formatRange(row.periodStart, row.periodEnd)}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {row.type || "Mensuel"}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-neutral-600">
                    {formatDate(row.periodEnd)}
                  </td>
                  <td className="px-3 py-4 text-neutral-700 font-medium">
                    {formatAmount(row.salary)}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusStyles[row.status] ||
                        "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}

              {payrollRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-neutral-400"
                  >
                    Aucune paie trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payroll;
