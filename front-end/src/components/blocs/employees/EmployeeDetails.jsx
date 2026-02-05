import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEmployeeStore } from "../../../store/employeeStore";
import Badge from "../../ui/badge";
import Button from "../../ui/button";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    employees,
    loading,
    error,
    fetchEmployees,
  } = useEmployeeStore();

  /* =========================
     FETCH SI NÉCESSAIRE
  ========================= */
  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, [employees.length, fetchEmployees]);

  /* =========================
     EMPLOYÉ COURANT
  ========================= */
  const employee = useMemo(
    () => employees.find((e) => e.id === id),
    [employees, id]
  );

  /* =========================
     STATES
  ========================= */
  if (loading) {
    return (
      <p className="p-6 text-sm text-neutral-500">
        Chargement…
      </p>
    );
  }

  if (error) {
    return (
      <p className="p-6 text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-neutral-600">
          Employé introuvable
        </p>
        <Button onClick={() => navigate("/employees")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-start justify-start p-4 space-y-6">
      {/* =========================
          BREADCRUMB
      ========================= */}
      <div className="text-sm text-neutral-500">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/employees")}
        >
          Employés
        </span>{" "}
        / <span className="text-neutral-800">Détail</span>
      </div>

      {/* =========================
          HEADER
      ========================= */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {employee.firstname} {employee.lastname}
          </h1>
          <p className="text-neutral-500 text-sm">
            {employee.position} – {employee.department}
          </p>
        </div>

        {employee.canEdit && (
          <Button
            buttonStyle
            className={"px-4 py-2 rounded-lg"}
            onClick={() =>
              navigate(`/employees/edit/${employee.id}`)
            }
          >
            Modifier
          </Button>
        )}
      </div>

      {/* =========================
          INFOS
      ========================= */}
      <div className="w-full h-full flex items-start justify-start gap-2">
        {/* Infos de l'employé gauche */}
            <div className="h-full flex-1 flex-col items-start justify-start space-y-2 px-4 border rounded-lg ">
                <h4 className="text-indigo-500 py-4 border-b font-semibold">Informations Personnelles</h4>
                <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg p-4">
                  <Info label="Téléphone" value={employee.phone} />
                  <Info label="Email" value={employee.email} />
                  <Info label="Genre" value={employee.gender} />
                  <Info
                    label="État civil"
                    value={employee.civilStatus}
                  />
                  <Info
                    label="Date de naissance"
                    value={
                      employee.dateOfBirth
                        ? employee.dateOfBirth.slice(0, 10)
                        : "-"
                    }
                  />
                  <Info
                    label="Lieu de naissance"
                    value={employee.placeofbirth}
                  />
                </div>
                <h4 className="text-indigo-500 py-4 border-b font-semibold">Contrat</h4>
                <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg p-4">
                  <Info label="Téléphone" value={employee.phone} />
                  <Info label="Email" value={employee.email} />
                  <Info label="Genre" value={employee.gender} />
                  <Info
                    label="État civil"
                    value={employee.civilStatus}
                  />
                  <Info
                    label="Date de naissance"
                    value={
                      employee.dateOfBirth
                        ? employee.dateOfBirth.slice(0, 10)
                        : "-"
                    }
                  />
                  <Info
                    label="Lieu de naissance"
                    value={employee.placeofbirth}
                  />
                  <Info
                    label="Entreprise"
                    value={employee.clientCompany?.companyName}
                  />
                  <Info
                    label="Salaire de base"
                    value={`${employee.baseSalary} USD`}
                  />

                  <div>
                    <p className="text-xs text-neutral-400">
                      Statut
                    </p>
                    <Badge status={employee.status} />
                  </div>
                </div>
                <h4 className="text-indigo-500 py-4 border-b font-semibold">Paie</h4>
                <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg p-4">
                  <Info label="Téléphone" value={employee.phone} />
                  <Info label="Email" value={employee.email} />
                  <Info label="Genre" value={employee.gender} />
                  <Info
                    label="État civil"
                    value={employee.civilStatus}
                  />
                  <Info
                    label="Date de naissance"
                    value={
                      employee.dateOfBirth
                        ? employee.dateOfBirth.slice(0, 10)
                        : "-"
                    }
                  />
                  <Info
                    label="Lieu de naissance"
                    value={employee.placeofbirth}
                  />
                  <Info
                    label="Entreprise"
                    value={employee.clientCompany?.companyName}
                  />
                  <Info
                    label="Salaire de base"
                    value={`${employee.baseSalary} USD`}
                  />

                  <div>
                    <p className="text-xs text-neutral-400">
                      Statut
                    </p>
                    <Badge status={employee.status} />
                  </div>
                </div>
            </div>

        {/* infos de l'employé droite */}
        <div className="w-1/3 h-full px-2 py-10 flex flex-col items-center justify-start gap-8 border rounded-lg">
                <div className="w-80 h-80  border rounded-full overflow-hidden">
                 <img src={employee.avatar} alt="" className="w-full h-full rounded-full fit-content" />
                </div>
                <div className="w-full text-center flex flex-col gap-2">
                  <p className="text-4xl text-indigo-600 font-semibold">{employee.firstname} {employee.lastname}</p>
                  <p className="">{employee.position}</p>
                  <p className="">{employee.department}</p>
                </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-neutral-400">
      {label}
    </p>
    <p className="font-medium">
      {value || "-"}
    </p>
  </div>
);

export default EmployeeDetails;
