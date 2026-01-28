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
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#a855f7", // purple
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
      <p className="text-sm text-neutral-500">
        Chargement…
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Aucune donnée disponible
      </p>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4 w-full">
      <h3 className="text-sm font-semibold text-neutral-700 mb-4">
        Répartition des entreprises par agents
      </h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* DONUT */}
        <div className="relative w-full lg:w-1/2 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
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

          {/* TOTAL AU CENTRE */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xl font-semibold text-neutral-900">
              {totalEmployees}
            </p>
            <p className="text-xs text-neutral-500">
              Agents au total
            </p>
          </div>
        </div>

        {/* LÉGENDE */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center gap-1">
          {data.map((item, index) => {
            const percent = (
              (item.value / totalEmployees) *
              100
            ).toFixed(1);

            return (
              <div
                key={item.name}
                className="flex items-center justify-start gap-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-neutral-700 text-[10px] font-medium truncate">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center  gap-4 text-neutral-500 text-[10px] text-left">
                  <span>{item.value} agents</span>
                  <span className="text-neutral-400">
                    {percent}%
                  </span>
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
