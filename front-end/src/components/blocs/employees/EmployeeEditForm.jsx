import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useEmployeeStore } from "../../../store/employeeStore";
import Button from "../../ui/button";

import ProfileTab from "./tabs/ProfileTab";
import ContractTab from "./tabs/ContractTab";
import PayrollTab from "./tabs/PayrollTab";
import AttendanceTab from "./tabs/AttendanceTab";
import LeavesTab from './tabs/LeavesTab';
import DisciplineTab from './tabs/DisciplineTab';

const TABS = [
  { key: "profile", label: "Profil" },
  { key: "contract", label: "Contrat" },
  { key: "payroll", label: "Paie" },
  { key: "attendance", label: "Présences" },
  { key: "leaves", label: "Congés" },
  { key: "discipline", label: "Discipline" },
];

const EmployeeEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const {
    employees,
    fetchEmployees,
    editEmployee,
    loading,
  } = useEmployeeStore();

  /* =========================
     EMPLOYÉ COURANT
  ========================= */
  const employee = useMemo(
    () => employees.find((e) => e.id === id),
    [employees, id]
  );

  /* =========================
     FORM
  ========================= */
  const methods = useForm({
    defaultValues: employee || {},
  });

  const { reset, handleSubmit } = methods;

  /* =========================
     FETCH / RESET
  ========================= */
  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, [employees.length, fetchEmployees]);

  useEffect(() => {
    if (employee) {
      reset(employee);
    }
  }, [employee, reset]);

  /* =========================
     SUBMIT
  ========================= */
  const onSubmit = async (data) => {
    const updated = await editEmployee(id, data);
    if (updated) {
      navigate(`/employees/${id}`);
    }
  };

  if (!employee) {
    return (
      <div className="p-6">
        <p>Employé introuvable</p>
        <Button onClick={() => navigate("/employees")}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 space-y-6"
      >
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
          /{" "}
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate(`/employees/${id}`)}
          >
            Détail
          </span>{" "}
          / <span className="text-neutral-800">Modifier</span>
        </div>

        {/* =========================
            HEADER
        ========================= */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Modifier {employee.firstname} {employee.lastname}
          </h1>

          <div className="flex gap-4">
            <Button
              type="button"
              className={"px-4 py-2 rounded-lg"}
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              buttonStyle
              className={"px-4 py-2 rounded-lg"}
              loading={loading}
              type="submit"
            >
              Enregistrer
            </Button>
          </div>
        </div>

        {/* =========================
            TABS
        ========================= */}
        <div className="border-b flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-neutral-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* =========================
            TAB CONTENT
        ========================= */}
        <div className="bg-white border rounded-lg p-6">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "contract" && <ContractTab />}
          {activeTab === "Congé" && <LeavesTab/>}
          {activeTab === "attendance" && <AttendanceTab />}
          {activeTab === "payroll" && <PayrollTab />}
          {activeTab === "Discipline" && <DisciplineTab/>}
        </div>
      </form>
    </FormProvider>
  );
};

export default EmployeeEditForm;
