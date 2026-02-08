import api from "./axios";

export const getPayrollDashboard = async (params = {}) => {
  const res = await api.get("/payroll/dashboard", {
    params,
  });
  return res.data;
};
