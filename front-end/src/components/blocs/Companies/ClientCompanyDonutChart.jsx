import React, { useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
];

const ClientCompanyDonutChart = () => {
  const clientCompanies = useClientCompanyStore(
    (s) => s.clientCompanies
  );
  const fetchClientCompanies = useClientCompanyStore(
    (s) => s.fetchClientCompanies
  );
  const loading = useClientCompanyStore((s) => s.loading);

  useEffect(() => {
    fetchClientCompanies();
  }, [fetchClientCompanies]);

  const data = useMemo(() => {
    return clientCompanies
      .filter((c) => (c._count?.employees ?? 0) > 0)
      .map((c) => ({
        name: c.companyName,
        value: c._count.employees,
      }));
  }, [clientCompanies]);

  const totalEmployees = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data]
  );

  if (loading) {
    return (
      <div className="bg-white border rounded-2xl p-4 h-full flex flex-col justify-center">
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border rounded-2xl p-4 h-full flex flex-col justify-center">
        <p className="text-sm text-neutral-400">
          Aucune donnée disponible
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-4 w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">
            Répartition des entreprises
          </h3>
          <p className="text-xs text-neutral-400">
            Agents par entreprise
          </p>
        </div>
        <span className="text-[11px] text-neutral-400">Mois en cours</span>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 flex-1 min-h-0">
        <div className="relative w-full h-[200px] sm:h-[220px] lg:h-full min-h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [
                  `${value} agents`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xl font-semibold text-neutral-900">
              {totalEmployees}
            </p>
            <p className="text-xs text-neutral-500">
              Agents au total
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 flex flex-col justify-center gap-2">
          {data.map((item, index) => {
            const percent = ((item.value / totalEmployees) * 100).toFixed(1);

            return (
              <div
                key={item.name}
                className="flex items-center justify-between gap-2 text-[11px] min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span
                    className="text-neutral-700 font-medium truncate"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-neutral-500">
                  <span>{item.value} agents</span>
                  <span className="text-neutral-400">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientCompanyDonutChart;
