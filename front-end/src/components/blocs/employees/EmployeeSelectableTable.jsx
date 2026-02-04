// src/components/blocs/employees/EmployeeSelectableTable.jsx
import React, { useEffect, useMemo } from "react";
import { useEmployeeStore } from "../../../store/employeeStore";
import Badge from "../../ui/badge";
import EmployeeActions from "./EmployeeActions";

const EmployeeSelectableTable = ({
  filters,
  selected,
  onSelectChange,
}) => {
  const {
    employees,
    fetchEmployees,
    removeEmployee,
    loading,
  } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (filters.status && e.status !== filters.status)
        return false;

      if (
        filters.companyId &&
        e.clientCompanyId !== filters.companyId
      )
        return false;

      if (
        filters.position &&
        !e.position
          ?.toLowerCase()
          .includes(filters.position.toLowerCase())
      )
        return false;

      if (
        filters.search &&
        !`${e.firstname} ${e.lastname}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      )
        return false;

      return true;
    });
  }, [employees, filters]);

  const toggleSelect = (id) => {
    onSelectChange((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredEmployees.length) {
      onSelectChange([]);
    } else {
      onSelectChange(filteredEmployees.map((e) => e.id));
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-neutral-500 p-4">
        Chargement…
      </p>
    );
  }

  return (
    <div className="bg-white rounded-lg h-full">
      <table className="w-full text-[12px]">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-3 text-left">
              <input
                type="checkbox"
                checked={
                  selected.length ===
                  filteredEmployees.length &&
                  filteredEmployees.length > 0
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-3 py-4 text-left">Nom</th>
            <th className="px-3 py-4 text-left">Poste</th>
            <th className="px-3 py-4 text-left">
              Entreprise
            </th>
            <th className="px-3 py-4 text-left">Statut</th>
            <th className="px-3 py-4 text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredEmployees.map((emp) => (
            <tr
              key={emp.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-3">
                <input
                  type="checkbox"
                  checked={selected.includes(emp.id)}
                  onChange={() => toggleSelect(emp.id)}
                />
              </td>

              <td className="px-3 py-2 font-medium">
                {emp.firstname} {emp.lastname}
              </td>

              <td className="px-3 py-2">
                {emp.position || "-"}
              </td>

              <td className="px-3 py-2">
                {emp.clientCompany?.companyName || "-"}
              </td>

              <td className="px-3 py-2">
                <Badge status={emp.status} />
              </td>

              <td className="px-3 py-2 text-right">
                <EmployeeActions
                  employee={emp}
                  onDelete={() =>
                    removeEmployee(emp.id)
                  }
                />
              </td>
            </tr>
          ))}

          {filteredEmployees.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-center py-6 text-gray-400"
              >
                Aucun employé trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeSelectableTable;
