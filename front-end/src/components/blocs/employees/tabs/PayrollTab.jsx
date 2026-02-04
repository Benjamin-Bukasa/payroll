import { Controller, useFormContext } from "react-hook-form";
import Input from "../../../ui/input";

const PayrollTab = () => {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Controller
        name="baseSalary"
        control={control}
        render={({ field }) => (
          <Input
            label="Salaire de base"
            type="number"
            {...field}
          />
        )}
      />
    </div>
  );
};

export default PayrollTab;
