// src/components/blocs/employees/EmployeeSelectableTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../../../store/employeeStore";
import { useToastStore } from "../../../store/toastStore";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";
import Badge from "../../ui/badge";
import EmployeeActions from "./EmployeeActions";
import Button from "../../ui/button";
import ConfirmModal from "../../ui/confirmModal";

const STATUS_OPTIONS = [
  { value: "ACTIF", label: "Actif" },
  { value: "INACTIF", label: "Inactif" },
  { value: "SUSPENDU", label: "Suspendu" },
];

const EmployeeSelectableTable = ({
  filters,
  selected,
  onSelectChange,
}) => {
  const navigate = useNavigate();
  const {
    employees,
    fetchEmployees,
    removeEmployee,
    editEmployee,
    loading,
  } = useEmployeeStore();

  const {
    clientCompanies,
    fetchClientCompanies,
  } = useClientCompanyStore();

  const addToast = useToastStore((s) => s.addToast);
  const [targetStatus, setTargetStatus] = useState("");
  const [targetCompanyId, setTargetCompanyId] =
    useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] =
    useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchClientCompanies();
  }, [fetchEmployees, fetchClientCompanies]);

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

  const handleBulkStatusChange = async () => {
    if (selected.length === 0) return;

    if (!targetStatus) {
      addToast({
        type: "error",
        message: "Sélectionnez un statut",
      });
      return;
    }

    setBulkLoading(true);
    const results = await Promise.all(
      selected.map((id) =>
        editEmployee(id, { status: targetStatus })
      )
    );
    setBulkLoading(false);

    const failed = results.filter((r) => !r).length;
    if (failed > 0) {
      addToast({
        type: "error",
        message:
          "Certaines mises à jour ont échoué",
      });
      return;
    }

    addToast({
      type: "success",
      message: "Statut mis à jour",
    });
    onSelectChange([]);
    setTargetStatus("");
  };

  const handleBulkCompanyChange = async () => {
    if (selected.length === 0) return;

    if (!targetCompanyId) {
      addToast({
        type: "error",
        message: "Sélectionnez une entreprise",
      });
      return;
    }

    setBulkLoading(true);
    const results = await Promise.all(
      selected.map((id) =>
        editEmployee(id, {
          clientCompanyId: targetCompanyId,
        })
      )
    );
    setBulkLoading(false);

    const failed = results.filter((r) => !r).length;
    if (failed > 0) {
      addToast({
        type: "error",
        message:
          "Certaines mises à jour ont échoué",
      });
      return;
    }

    addToast({
      type: "success",
      message: "Employés mis à jour",
    });
    onSelectChange([]);
    setTargetCompanyId("");
  };

  const handleConfirmBulkDelete = async () => {
    setBulkLoading(true);
    await Promise.all(
      selected.map((id) => removeEmployee(id))
    );
    setBulkLoading(false);
    setConfirmDeleteOpen(false);
    onSelectChange([]);
    addToast({
      type: "success",
      message: "Employés supprimés",
    });
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
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Supprimer des employés"
        description="Voulez-vous vraiment supprimer les employés sélectionnés ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b px-3 py-3 bg-indigo-50">
          <p className="text-sm font-medium">
            {selected.length} sélectionné(s)
          </p>

          <select
            className="text-sm border rounded-md px-2 py-1"
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value)}
          >
            <option value="">Changer statut</option>
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <Button
            buttonStyle
            className="px-4 py-2 rounded-lg"
            onClick={handleBulkStatusChange}
            loading={bulkLoading}
          >
            Appliquer
          </Button>

          <select
            className="text-sm border rounded-md px-2 py-1"
            value={targetCompanyId}
            onChange={(e) =>
              setTargetCompanyId(e.target.value)
            }
          >
            <option value="">Changer entreprise</option>
            {clientCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>

          <Button
            buttonStyle
            className="px-4 py-2 rounded-lg"
            onClick={handleBulkCompanyChange}
            loading={bulkLoading}
          >
            Appliquer
          </Button>

          <Button
            buttonStyle={false}
            className="px-4 py-2 rounded-lg"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={bulkLoading}
          >
            Supprimer
          </Button>
        </div>
      )}

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
            <th className="px-3 py-4 text-left">Avatar</th>
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

              <td className="px-3 py-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-500">
                  {emp.avatar ? (
                    <img
                      src={emp.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "IMG"
                  )}
                </div>
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
                  onView={(employee) =>
                    navigate(`/employees/${employee.id}`)
                  }
                  onEdit={(employee) =>
                    navigate(`/employees/edit/${employee.id}`)
                  }
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
                colSpan={7}
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
