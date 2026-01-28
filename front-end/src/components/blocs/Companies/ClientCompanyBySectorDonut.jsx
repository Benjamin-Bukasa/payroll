import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";

/* ===============================
   COULEURS
=============================== */
const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#64748b",
];

/* ===============================
   TRADUCTION DES SECTEURS
=============================== */
const SECTOR_LABELS = {
  GENERAL: "Général",
  IT: "Informatique",
  FINANCE: "Finance",
  INDUSTRY: "Industrie",
  TRANSPORT: "Transport",
  HEALTH: "Santé",
  EDUCATION: "Éducation",
  OTHER: "Autres",
};

const ClientCompanyBySectorDonut = () => {
  const clientCompanies = useClientCompanyStore(
    (s) => s.clientCompanies
  );
  const fetchClientCompanies = useClientCompanyStore(
    (s) => s.fetchClientCompanies
  );
  const loading = useClientCompanyStore((s) => s.loading);

  /* ===============================
     FILTRE DE PÉRIODE
  =============================== */
  const [period, setPeriod] = useState("MONTH"); // MONTH | YEAR | ALL

  useEffect(() => {
    fetchClientCompanies();
  }, [fetchClientCompanies]);

  /* ===============================
     AGRÉGATION + FILTRAGE
  =============================== */
  const data = useMemo(() => {
    const now = new Date();
    let startDate = null;

    if (period === "MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "YEAR") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const sectorMap = {};

    clientCompanies.forEach((company) => {
      if (
        startDate &&
        new Date(company.createdAt) < startDate
      ) {
        return;
      }

      const sector =
        SECTOR_LABELS[company.activitySector] ||
        SECTOR_LABELS.OTHER;

      const count = company._count?.employees ?? 0;

      sectorMap[sector] =
        (sectorMap[sector] || 0) + count;
    });

    const rawData = Object.entries(sectorMap)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);

    const total = rawData.reduce(
      (sum, d) => sum + d.value,
      0
    );

    /* ===============================
       REGROUPEMENT "AUTRES"
    =============================== */
    let othersValue = 0;
    const filtered = [];

    rawData.forEach((item) => {
      const percent = (item.value / total) * 100;
      if (percent < 5) {
        othersValue += item.value;
      } else {
        filtered.push(item);
      }
    });

    if (othersValue > 0) {
      filtered.push({
        name: "Autres",
        value: othersValue,
      });
    }

    return filtered;
  }, [clientCompanies, period]);

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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700">
          Répartition des agents par secteur
        </h3>

        {/* FILTRE */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs border rounded-md px-2 py-1"
        >
          <option value="MONTH">Ce mois</option>
          <option value="YEAR">Cette année</option>
          <option value="ALL">Tout</option>
        </select>
      </div>

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

          {/* TOTAL */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold">
              {totalEmployees}
            </p>
            <p className="text-xs text-neutral-500">
              Agents
            </p>
          </div>
        </div>

        {/* LÉGENDE */}
        <div className="w-full lg:w-1/2 flex flex-col gap-2">
          {data.map((item, index) => {
            const percent = (
              (item.value / totalEmployees) *
              100
            ).toFixed(1);

            return (
              <div
                key={item.name}
                className="flex justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="font-medium">
                    {item.name}
                  </span>
                </div>

                <div className="flex gap-4 text-neutral-500">
                  <span>{item.value}</span>
                  <span>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientCompanyBySectorDonut;
