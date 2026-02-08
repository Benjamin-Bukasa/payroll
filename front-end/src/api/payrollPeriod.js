import api from "./axios";

export const getPayrollPeriods = async (params = {}) => {
  const res = await api.get("/payrollPeriod", {
    params,
  });
  return res.data;
};

export const createPayrollPeriod = async (payload) => {
  const res = await api.post("/payrollPeriod", payload);
  return res.data;
};

export const closePayrollPeriod = async (periodId) => {
  const res = await api.patch(
    `/payrollPeriod/${periodId}/close`
  );
  return res.data;
};

export const reopenPayrollPeriod = async (periodId) => {
  const res = await api.patch(
    `/payrollPeriod/${periodId}/reopen`
  );
  return res.data;
};
