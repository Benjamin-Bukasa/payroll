import { Controller, useForm } from "react-hook-form";
import Button from "../../ui/button";
import Input from "../../ui/input";
import api from "../../../api/axios";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";
import { useEmployeeStore } from "../../../store/employeeStore";

const AttendanceForm = () => {
  const { control, handleSubmit, watch } = useForm();
  const { clientCompanies } = useClientCompanyStore();
  const { employees } = useEmployeeStore();

  const selectedCompanyId = watch("clientCompanyId");

 const onSubmit = async (data) => {
  try {
    await api.post(
      "/employeeAttendance/create",
      {
        employeeId: data.employeeId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      }
    );

    alert("Pointage enregistré avec succès ✅");
  } catch (err) {
    console.error(err);
    alert(
      err.response?.data?.message ||
        "Erreur lors de l’enregistrement"
    );
  }
};


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg p-4 space-y-6 bg-white border"
    >
      <h3 className="font-semibold text-indigo-600 border-b pb-4">
        Enregistrer un pointage
      </h3>

      {/* ENTREPRISE */}
      <Controller
        name="clientCompanyId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <select {...field} className="border rounded-lg p-2 w-full">
            <option value="">Entreprise cliente</option>
            {clientCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        )}
      />

      {/* EMPLOYÉ (filtré par entreprise) */}
      <Controller
        name="employeeId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <select {...field} className="border rounded-lg p-2 w-full">
            <option value="">Employé</option>
            {employees
              .filter(
                (e) => e.clientCompanyId === selectedCompanyId
              )
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstname} {e.lastname}
                </option>
              ))}
          </select>
        )}
      />

      {/* HEURES */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="checkIn"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input
              label="Entrée"
              type="datetime-local"
              {...field}
            />
          )}
        />

        <Controller
          name="checkOut"
          control={control}
          render={({ field }) => (
            <Input
              label="Sortie"
              type="datetime-local"
              {...field}
            />
          )}
        />
      </div>

      {/* PÉRIODE (OPTIONNEL – POUR FILTRE / RAPPORT) */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="periodStart"
          control={control}
          render={({ field }) => (
            <Input label="Du" type="date" {...field} />
          )}
        />

        <Controller
          name="periodEnd"
          control={control}
          render={({ field }) => (
            <Input label="Au" type="date" {...field} />
          )}
        />
      </div>

      <Button
        type="submit"
        buttonStyle
        className="w-full py-2 rounded-lg"
      >
        Enregistrer le pointage
      </Button>
    </form>
  );
};

export default AttendanceForm;
