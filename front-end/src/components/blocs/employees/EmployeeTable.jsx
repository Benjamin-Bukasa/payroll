import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../../../store/employeeStore";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";
import { useToastStore } from "../../../store/toastStore";
import EmployeeActions from "./EmployeeActions";
import Badge from "../../ui/badge";
import Button from "../../ui/button";
import ConfirmModal from "../../ui/confirmModal";

const EmployeeTable = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [selectedIds, setSelectedIds] = useState([]);
  const [targetCompanyId, setTargetCompanyId] =
    useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] =
    useState(false);

  const {
    employees,
    loading,
    error,
    fetchEmployees,
    removeEmployee,
    editEmployee,
  } = useEmployeeStore();

  const {
    clientCompanies,
    fetchClientCompanies,
  } = useClientCompanyStore();

  useEffect(() => {
    fetchEmployees();
    fetchClientCompanies();
  }, [fetchEmployees, fetchClientCompanies]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) =>
        employees.some((emp) => emp.id === id)
      )
    );
  }, [employees]);

  const allSelected =
    employees.length > 0 &&
    selectedIds.length === employees.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(employees.map((emp) => emp.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkCompanyChange = async () => {
    if (selectedIds.length === 0) return;

    if (!targetCompanyId) {
      addToast({
        type: "error",
        message: "Sélectionnez une entreprise cible",
      });
      return;
    }

    setBulkLoading(true);
    const results = await Promise.all(
      selectedIds.map((id) =>
        editEmployee(id, { clientCompanyId: targetCompanyId })
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
    setSelectedIds([]);
    setTargetCompanyId("");
  };

  const handleConfirmBulkDelete = async () => {
    setBulkLoading(true);
    await Promise.all(
      selectedIds.map((id) => removeEmployee(id))
    );
    setBulkLoading(false);
    setConfirmDeleteOpen(false);
    setSelectedIds([]);
    addToast({
      type: "success",
      message: "Employés supprimés",
    });
  };

  if (loading) return <p className="text-sm">Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-start justify-start">
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Supprimer des employés"
        description="Voulez-vous vraiment supprimer les employés sélectionnés ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      {selectedIds.length > 0 && (
        <div className="w-full mb-4 flex flex-wrap items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-sm font-medium">
            {selectedIds.length} sélectionné(s)
          </p>

          <select
            className="text-sm border rounded-md px-2 py-1"
            value={targetCompanyId}
            onChange={(e) =>
              setTargetCompanyId(e.target.value)
            }
          >
            <option value="">Changer d’entreprise</option>
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
        <thead className="bg-neutral-50 border-b font-medium">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Poste</th>
            <th className="px-4 py-3 text-left">Département</th>
            <th className="px-4 py-3 text-left">Entreprise</th>
            <th className="px-4 py-3 text-left">Statut</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(emp.id)}
                  onChange={() => toggleSelect(emp.id)}
                />
              </td>
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center text-xs">
                    {emp.avatar ? (
                      <img src={emp.avatar} alt="" />
                    ) : (
                      "IMG"
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span>
                      {emp.firstname} {emp.lastname}
                    </span>
                    <span className="text-neutral-400 text-[11px]">
                      {emp.phone}
                    </span>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3">{emp.position}</td>
              <td className="px-4 py-3">{emp.department}</td>
              <td className="px-4 py-3">
                {emp.clientCompany?.companyName}
              </td>

              <td className="px-4 py-3">
                <Badge status={emp.status} />
              </td>

              <td className="px-4 py-3 text-right">
                <EmployeeActions
                  employee={emp}
                  onView={(employee) =>
                    navigate(`/employees/${employee.id}`)
                  }
                  onEdit={(employee) =>
                    navigate(`/employees/edit/${employee.id}`)
                  }
                  onDelete={(employee) =>
                    removeEmployee(employee.id)
                  }
                />
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan="7"
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

export default EmployeeTable;
