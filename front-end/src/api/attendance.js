import api from "./axios";

/**
 * Récupérer tous les pointages
 * (avec employee + clientCompany côté backend)
 */
export const getAttendances = async () => {
  const res = await api.get("/employeeAttendance");
  return res.data;
};

/**
 * RÃ©cupÃ©rer les pointages pour la table RH
 */
export const getAttendancesTable = async (params = {}) => {
  const res = await api.get("/employeeAttendance/table", {
    params,
  });
  return res.data;
};

export const getAttendanceById = async (attendanceId) => {
  const res = await api.get(`/employeeAttendance/${attendanceId}`);
  return res.data;
};

export const updateAttendance = async (attendanceId, payload) => {
  const res = await api.patch(
    `/employeeAttendance/${attendanceId}`,
    payload
  );
  return res.data;
};

export const deleteAttendance = async (attendanceId) => {
  const res = await api.delete(`/employeeAttendance/${attendanceId}`);
  return res.data;
};

export const recalculateAttendanceOvertime = async (payload) => {
  const res = await api.post("/employeeAttendance/recalculate", payload);
  return res.data;
};

/**
 * TÃ©lÃ©charger le template Excel
 */
export const downloadAttendanceTemplate = async () => {
  const res = await api.get("/employeeAttendance/template/excel", {
    responseType: "blob",
  });

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "attendance_template.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
