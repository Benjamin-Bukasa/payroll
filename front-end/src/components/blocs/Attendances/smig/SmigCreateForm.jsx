import { useForm, Controller } from "react-hook-form";
import Button from "../../../ui/button";
import Input from "../../../ui/input";
import api from "../../../../api/axios";

const SmigCreateForm = ({ onCreated }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      categorie: "",
      echelon: "",
      tension: "",
      colonne: "",
      dailyRate: "",
      isActive: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        dailyRate: Number(data.dailyRate),
      };

      const res = await api.post("/smig", payload);

      onCreated?.(res.data);
      reset();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Erreur lors de la création du SMIG"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border rounded-lg p-6 space-y-5"
    >
      <h2 className="text-lg font-semibold text-indigo-600">
        Créer un SMIG
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="categorie"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input label="Catégorie" {...field} />
          )}
        />

        <Controller
          name="echelon"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input label="Échelon" {...field} />
          )}
        />

        <Controller
          name="tension"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input label="Tension" {...field} />
          )}
        />

        <Controller
          name="colonne"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input label="Colonne" {...field} />
          )}
        />

        <Controller
          name="dailyRate"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input
              label="SMIG journalier"
              type="number"
              min={0}
              {...field}
            />
          )}
        />
      </div>

      {/* ACTIF */}
      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            SMIG actif (par défaut)
          </label>
        )}
      />

      <Button
        type="submit"
        loading={isSubmitting}
        buttonStyle
        className="w-full py-2 rounded-lg"
      >
        Enregistrer le SMIG
      </Button>
    </form>
  );
};

export default SmigCreateForm;
