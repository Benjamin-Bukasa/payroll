import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../../store/authStore";
import { MessageCircleQuestionMark } from "lucide-react";
import Logo from "../ui/logo";
import Input from "../ui/input";
import Button from "../ui/button";

const LoginLeft = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const errorMessage = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const googleLoginStore = useAuthStore((s) => s.googleLogin);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const setRememberMe = useAuthStore((s) => s.setRememberMe);


  const onSubmit = async (data) => {
    await login(data);
    console.log();
    navigate("/dashboard")
  };

  return (
    <div className="sm:w-full md:w-full xl:w-1/2 sm:h-screen md:h-screen xl:h-screen sm:flex md:flex xl:flex sm:flex-col md:flex-col xl:flex-col sm:justify-between md:justify-between xl:justify-between sm:items-center md:items-center xl:items-center md:px-4 xl:px-8 font-inter">
      {/* HEADER */}
      <div className="px-2 sm:w-full sm:flex sm:items-center sm:justify-between md:w-full xl:w-full md:flex xl:flex md:items-center xl:items-center md:justify-between xl:justify-between sm:py-2 md:py-2 xl:py-2 text-[14px] bg-white border-b border-gray-200">
        <Logo
          className="sm:w-1/3 md:w-1/3 xl:w-1/3 sm:flex md:flex xl:flex sm:justify-start md:justify-start xl:justify-start sm:items-center md:items-center xl:items-center sm:gap-2 md:gap-2 xl:gap-2 text-indigo-600 font-semibold"
          iconSize={40}
        >
          <span className="md:text-xl xl:text-xl text-gray-900 font-semibold">
            Neopayroll
          </span>
        </Logo>

        <div className="sm:w-2/3 md:w-2/3 xl:w-2/3 sm:flex md:flex xl:flex sm:items-center md:items-center xl:items-center sm:justify-end md:justify-end xl:justify-end md:gap-2 xl:gap-4 md:py-2 xl:py-2">
          <div className="sm:w-full md:w-full xl:w-full sm:flex md:flex xl:flex sm:items-center md:items-center xl:items-center sm:justify-end md:justify-end xl:justify-end sm:gap-2 md:gap-4 xl:gap-4">
            <div className="xl:w-1/8 text-gray-500 border-r border-gray-300 xl:pr-4">
              <MessageCircleQuestionMark size={16} />
            </div>
            <p className="xl:w-7/8 text-end">
              Vous n'avez pas de compte ?
            </p>
            <Button className="xl:w-1/8 px-4 py-2 rounded-md" buttonStyle={false}>
              Créer
            </Button>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="md:w-[60%] xl:w-[45%] md:flex xl:flex md:flex-col xl:flex-col md:gap-8 xl:gap-8">
        <div className="xl:flex xl:flex-col xl:gap-2">
          <h1 className="text-2xl font-semibold">Connexion</h1>
          <p className="text-sm text-gray-500 font-medium">
            Entrez vos information de connexion
          </p>
        </div>

        {/* BACKEND ERROR */}
        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:flex xl:flex md:flex-col xl:flex-col md:justify-between xl:justify-between md:gap-12 xl:gap-12"
        >
          <div className="md:flex xl:flex md:flex-col xl:flex-col md:gap-8 xl:gap-4">
            {/* EMAIL */}
            <Controller
              name="email"
              control={control}
              rules={{ required: "Email obligatoire" }}
              render={({ field }) => (
                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearError();
                  }}
                />
              )}
            />

            {/* PASSWORD */}
            <Controller
              name="password"
              control={control}
              rules={{ required: "Mot de passe obligatoire" }}
              render={({ field }) => (
                <Input
                  label="Mot de passe"
                  type="password"
                  error={errors.password?.message}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearError();
                  }}
                />
              )}
            />

            <div className="md:flex xl:flex md:items-center xl:items-center md:justify-between xl:justify-between text-[14px]">
              <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <p>Se souvenir de moi</p>
              </div>

              <p className="cursor-pointer text-indigo-500">
                Mot de passe oublié ?
              </p>
            </div>

            <Button
              loading={loading}
              buttonStyle={true}
              className="w-full px-4 py-2 rounded-md"
            >
              Login
            </Button>
          </div>
        </form>

        <div className="h-0.5 text-center border-t">
          <span className="relative bottom-3.5 p-2 bg-white text-gray-500">
            ou continuer avec
          </span>
        </div>

        {/* GOOGLE LOGIN */}
        {/* < className="w-full xl:w-full xl:flex items-center xl:justify-center xl:mt-2 xl:py-9 border-t"> */}
          <GoogleLogin className='w-full'
            onSuccess={async (credentialResponse) => {
              // credentialResponse.credential === id_token
              await googleLoginStore(credentialResponse.credential);
              navigate('/dashboard')
            }}
            onError={() => {
              console.log("Google Login Failed");
            }}
            useOneTap={false}
          />
        

      </div>

      {/* FOOTER */}
      <div className="md:w-full xl:w-full md:py-4 xl:py-4 border-t border-gray-200">
        footer
      </div>
    </div>
  );
};

export default LoginLeft;
