import api from "./axios";

/**
 * Récupérer tous les pointages
 * (avec employee + clientCompany côté backend)
 */
export const getAttendances = async () => {
  const res = await api.get("/employeeAttendance");
  return res.data;
};
