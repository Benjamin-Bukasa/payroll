import { useEffect } from "react";
import { useEmployeeStore } from "./../../../store/employeeStore";
import EmployeeActions from "./EmployeeActions";

const EmployeeTable = () => {
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    removeEmployee,
  } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) return <p className="text-sm">Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white overflow-hidden">
      <table className="w-full text-[12px]">
        <thead className="bg-neutral-50 border-b font-medium">
          <tr>
            <th className="px-4 py-3 text-left">Nom</th>
            <th className="px-4 py-3 text-left">Poste</th>
            <th className="px-4 py-3 text-left">Département</th>
            <th className="px-4 py-3 text-left">Entreprise</th>
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
                {emp.firstname} {emp.lastname}
              </td>
              <td className="px-4 py-3">{emp.position}</td>
              <td className="px-4 py-3">{emp.department}</td>
              <td className="px-4 py-3">
                {emp.clientCompany?.companyName}
              </td>
              <td className="px-4 py-3 text-right">
                <EmployeeActions
                  employee={emp}
                  onEdit={(employee) =>
                    console.log("EDIT", employee)
                  }
                  onDelete={(employee) => {
                    if (
                      confirm(
                        `Supprimer ${employee.firstname} ${employee.lastname} ?`
                      )
                    ) {
                      removeEmployee(employee.id);
                    }
                  }}
                />
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan="5"
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
