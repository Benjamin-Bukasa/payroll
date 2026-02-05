import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../../../store/employeeStore";
import EmployeeActions from "./EmployeeActions";
import Badge from "../../ui/badge";

const EmployeeTable = () => {
  const navigate = useNavigate();

  const {
    employees,
    loading,
    error,
    fetchEmployees,
    removeEmployee,
  } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (loading) return <p className="text-sm">Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-start justify-start">
      <table className="w-full text-[12px]">
        <thead className="bg-neutral-50 border-b font-medium">
          <tr>
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
                colSpan="6"
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
