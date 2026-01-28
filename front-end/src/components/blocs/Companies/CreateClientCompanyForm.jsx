import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";
import Input from "../../ui/input";
import Button from "../../ui/button";
import SuccessModal from "../../ui/SuccessModal";
import ConfirmModal from "../../ui/ConfirmModal";

const CreateClientCompanyForm = ({ onSuccess }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      companyName: "",
      email: "",
      address: "",
      idNat: "",
      rccm: "",
      numImpot: "",
    },
  });

  const createClientCompany = useClientCompanyStore(
    (s) => s.createClientCompany
  );
  const loading = useClientCompanyStore((s) => s.loading);
  const createError = useClientCompanyStore(
    (s) => s.createError
  );
  const clearCreateError = useClientCompanyStore(
    (s) => s.clearCreateError
  );

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const onSubmit = async (data) => {
    const payload = {
      companyName: data.companyName,
      email: data.email || null,
      address: data.address,
      idNat: data.idNat || null,
      rccm: data.rccm || null,
      numImpot: data.numImpot || null,
    };

    const created = await createClientCompany(payload);

    if (created) {
      setCreatedName(created.companyName);
      setSuccessOpen(true);
      onSuccess?.();
    }
  };

  return (
    <>
      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col justify-between"
      >
        <div className="grid grid-cols-2 gap-6">
          <Controller
            name="companyName"
            control={control}
            rules={{ required: "Nom obligatoire" }}
            render={({ field }) => (
              <Input
                label="Nom de l’entreprise"
                error={errors.companyName?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input label="Email" type="email" {...field} />
            )}
          />

          <Controller
            name="address"
            control={control}
            rules={{ required: "Adresse obligatoire" }}
            render={({ field }) => (
              <Input
                label="Adresse"
                error={errors.address?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="idNat"
            control={control}
            render={({ field }) => (
              <Input label="ID NAT" {...field} />
            )}
          />

          <Controller
            name="rccm"
            control={control}
            render={({ field }) => (
              <Input label="RCCM" {...field} />
            )}
          />

          <Controller
            name="numImpot"
            control={control}
            render={({ field }) => (
              <Input label="Numéro d’impôt" {...field} />
            )}
          />
        </div>

        <Button
          loading={loading}
          className="w-full py-2 rounded-md mt-6"
          buttonStyle
        >
          Créer l’entreprise cliente
        </Button>
      </form>

      {/* ================= SUCCESS MODAL ================= */}
      <SuccessModal
        open={successOpen}
        title="Entreprise créée"
        message={`Vous avez créé l’entreprise cliente "${createdName}" avec succès 🎉`}
        onClose={() => {
          setSuccessOpen(false);
          reset(); // ✅ RESET AU BON MOMENT
        }}
      />

      {/* ================= ERROR MODAL ================= */}
      <ConfirmModal
        open={!!createError}
        title="Création impossible"
        description={createError}
        confirmLabel="Fermer"
        hideCancel
        onConfirm={clearCreateError}
        onClose={clearCreateError}
      />
    </>
  );
};

export default CreateClientCompanyForm;
