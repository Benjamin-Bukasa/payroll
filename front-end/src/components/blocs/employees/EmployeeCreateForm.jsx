import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";


import Input from "../../ui/input";
import Button from "../../ui/button";
import ScrollArea from "../../ui/scroll-area";
import SuccessModal from "../../ui/SuccessModal";

import { useEmployeeStore } from "../../../store/employeeStore";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";
import ImportEmployeeForm from "./ImportEmployeeForm";


const EmployeeCreateForm = () => {

    

  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      firstname: "",
      middlename: "",
      lastname: "",
      gender: "",
      civilStatus: "",
      dateOfBirth: "",
      placeofbirth: "",
      children: 0,
      address: "",
      phone: "",

      contractStart: "",
      contractEnd: "",
      position: "",
      department: "",
      contractType: "",
      baseSalary: "",
      salaryCurrency: "USD",

      clientCompanyId: "",
    },
  });

  const {
    createEmployee,
    loading,
    error,
    clearError,
  } = useEmployeeStore();

  const {
    clientCompanies,
    fetchClientCompanies,
  } = useClientCompanyStore();

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const navigate = useNavigate();

  /* =========================
     FETCH CLIENT COMPANIES
  ========================= */
  useEffect(() => {
    if (clientCompanies.length === 0) {
      fetchClientCompanies();
    }
  }, [fetchClientCompanies, clientCompanies.length]);

  /* =========================
     SUBMIT
  ========================= */
  const onSubmit = async (data) => {
    clearError();

    const payload = {
      ...data,
      baseSalary: Number(data.baseSalary),
      children: Number(data.children),
    };

    const created = await createEmployee(payload);

    if (created) {
      setCreatedEmployee(created);
      setSuccessOpen(true);
      reset();
      
    }
  };

  return (
    <>
      <section className="w-full h-full flex gap-4 p-4">
        {/* ================= FORM ================= */}
        <ScrollArea className="flex-1 h-[820px] pr-4 border-none">
          <h3 className="sticky top-0 bg-white px-2 py-2 text-lg font-semibold text-indigo-600">
            Ajouter un nouvel employé
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6 mt-4"
          >
            {/* ================= INFOS PERSONNELLES ================= */}
            <div className="rounded-lg p-4 border">
              <h4 className="pb-2 mb-4 text-indigo-500 font-medium border-b">
                Informations personnelles
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Controller
                  name="firstname"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input label="Prénom" {...field} />
                  )}
                />

                <Controller
                  name="middlename"
                  control={control}
                  render={({ field }) => (
                    <Input label="Post-nom" {...field} />
                  )}
                />

                <Controller
                  name="lastname"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input label="Nom" {...field} />
                  )}
                />

                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Input label="Date de naissance" type="date" {...field} />
                  )}
                />

                <Controller
                  name="placeofbirth"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input label="Lieu de naissance" {...field} />
                  )}
                />

                <Controller
                  name="children"
                  control={control}
                  render={({ field }) => (
                    <Input label="Nombre d’enfants" type="number" min={0} {...field} />
                  )}
                />

                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input label="Adresse" {...field} />
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input label="Téléphone" type="tel" {...field} />
                  )}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="py-2 border rounded-lg">
                      <option value="">Genre</option>
                      <option value="HOMME">Homme</option>
                      <option value="FEMME">Femme</option>
                    </select>
                  )}
                />

                <Controller
                  name="civilStatus"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="py-2 border rounded-lg">
                      <option value="">État civil</option>
                      <option value="CELIBATAIRE">Célibataire</option>
                      <option value="MARIE">Marié(e)</option>
                    </select>
                  )}
                />
              </div>
            </div>

            {/* ================= CONTRAT ================= */}
            <div className="rounded-lg p-4 border">
              <h4 className="pb-2 mb-4 text-indigo-500 font-medium border-b">
                Contrat & affectation
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Controller
                  name="contractStart"
                  control={control}
                  render={({ field }) => (
                    <Input label="Début contrat" type="date" {...field} />
                  )}
                />

                <Controller
                  name="contractEnd"
                  control={control}
                  render={({ field }) => (
                    <Input label="Fin contrat" type="date" {...field} />
                  )}
                />

                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <Input label="Poste" {...field} />
                  )}
                />

                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <Input label="Département" {...field} />
                  )}
                />

                <div className="flex items-center gap-2">
                  <Controller
                    name="baseSalary"
                    control={control}
                    render={({ field }) => (
                      <Input
                        
                        placeholder="Salaire de base"
                        type="number"
                        {...field}
                        className="flex-1"
                      />
                    )}
                  />

                  <Controller
                    name="salaryCurrency"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className="py-2 rounded-lg border">
                        <option value="USD">USD</option>
                        <option value="CDF">CDF</option>
                      </select>
                    )}
                  />
                </div>

                <Controller
                  name="contractType"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="py-2 border rounded-lg">
                      <option value="">Type de contrat</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="STAGE">Stage</option>
                      <option value="PRESTATION">Prestation</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  )}
                />

                <Controller
                  name="clientCompanyId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select {...field} className="py-2 border rounded-lg">
                      <option value="">Entreprise d’affectation</option>
                      {clientCompanies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            <Button loading={loading} buttonStyle className="w-full py-2 rounded-lg">
              Créer l’employé
            </Button>
          </form>
        </ScrollArea>

        {/* ================= ASIDE ================= */}
        <aside className="w-1/3 flex flex-col gap-6 overflow-y-auto">
          <div className="border rounded-lg p-2">
            <h4 className="py-2 border-b font-semibold text-indigo-600">
              Importer les employés
            </h4>
            <ImportEmployeeForm />
          </div>
        </aside>
      </section>

      {/* ✅ MODAL SUCCÈS */}
      <SuccessModal
      
        open={successOpen}
        title="Employé créé"
        message={
          createdEmployee
            ? `L’employé ${createdEmployee.firstname} ${createdEmployee.lastname} a été créé avec succès 🎉`
            : ""
        }
        onClose={
            () => {
                setSuccessOpen(false)
                navigate(`/employees`)
            }
            
        }
      />
    </>
  );
};

export default EmployeeCreateForm;
