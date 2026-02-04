import { Controller, useFormContext } from "react-hook-form";
import Input from "../../../ui/input";

const ProfileTab = () => {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Controller
        name="firstname"
        control={control}
        render={({ field }) => (
          <Input label="Prénom" {...field} />
        )}
      />

      <Controller
        name="lastname"
        control={control}
        render={({ field }) => (
          <Input label="Nom" {...field} />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <Input label="Téléphone" {...field} />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input label="Email" {...field} />
        )}
      />
    </div>
  );
};

export default ProfileTab;
