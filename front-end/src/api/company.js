import api from "./axios";

export const getCompanyMe = async () => {
  const res = await api.get("/company/me");
  return res.data;
};

export const updateCompanyMe = async (payload) => {
  const res = await api.patch("/company/me", payload);
  return res.data;
};

export const updateCompanyLogo = async (file) => {
  const formData = new FormData();
  formData.append("logo", file);

  const res = await api.patch("/company/me/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
