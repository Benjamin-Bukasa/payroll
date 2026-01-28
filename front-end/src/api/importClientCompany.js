// src/api/importClientCompany.js
import api from "./axios";

export const downloadClientCompanyTemplate = async () => {
  const res = await api.get(
    "/clientCompany/template/excel",
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "client_company_template.xlsx";
  a.click();
};

export const importClientCompanies = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    "/clientCompany/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};
