// src/pages/dashboard/Employees.jsx
import React, { useState } from "react";
import ScrollArea from "../../components/ui/scroll-area";
import ImportEmployeeForm from "../../components/blocs/employees/ImportEmployeeForm";
import EmployeeSummary from "../../components/blocs/employees/EmployeeSummary";
import EmployeesChart from "../../components/blocs/Home/EmployeesChart";
import EmployeeSelectableTable from "../../components/blocs/employees/EmployeeSelectableTable";
import EmployeeFilters from "../../components/blocs/employees/EmployeeFilters";

function Employees() {
  const [filters, setFilters] = useState({
    status: "",
    companyId: "",
    position: "",
    search: "",
  });

  const [selected, setSelected] = useState([]);

  return (
    <div className="h-full flex flex-col xl:flex-row gap-4 p-4">

      {/* ===== GAUCHE ===== */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* SUMMARY */}
        <div className="w-full flex flex-col md:flex-row gap-4">
          <EmployeeSummary />
        </div>

        {/* TABLE + STICKY HEADER */}
        <ScrollArea className="xl:h-full">
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h3 className="text-lg font-semibold">
                Liste de tous les employés
              </h3>
            </div>

            {/* FILTRES */}
            <EmployeeFilters
              filters={filters}
              onChange={(patch) =>
                setFilters((prev) => ({
                  ...prev,
                  ...patch,
                }))
              }
            />
          </div>

          <EmployeeSelectableTable
            filters={filters}
            selected={selected}
            onSelectChange={setSelected}
          />
        </ScrollArea>
      </div>

      {/* ===== DROITE ===== */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="">
          <EmployeesChart />
        </div>
        <div className="rounded-lg border p-3">
          <ImportEmployeeForm />
        </div>
      </div>
    </div>
  );
}

export default Employees;
