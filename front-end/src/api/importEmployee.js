// src/api/importEmployee.js
import api from "./axios";

export const importEmployees = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    "/employee/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};

export const downloadEmployeeTemplate = async () => {
  const res = await api.get(
    "/employee/template/excel",
    { responseType: "blob" }
  );

  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employee_template.xlsx";
  a.click();
};
