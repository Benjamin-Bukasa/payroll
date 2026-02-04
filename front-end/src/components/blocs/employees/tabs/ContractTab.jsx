import { Controller, useFormContext } from "react-hook-form";
import Input from "../../../ui/input";

const ContractTab = () => {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
    </div>
  );
};

export default ContractTab;
