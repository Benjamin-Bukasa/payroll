// src/api/importClientCompany.js
import api from "./axios";

export const downloadEmployeeAttendanceTemplate = async () => {
  const res = await api.get(
    "/employeeAttendance/template/excel",
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employee_attendance_template.xlsx";
  a.click();
};

export const importEmployeeAttendances = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    "/employeeAttendance/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};
