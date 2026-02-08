import api from "./axios";

export const getPayrollSettings = async () => {
  const res = await api.get("/payrollSetting");
  return res.data;
};

export const getPayrollSettingByClientCompany = async (
  clientCompanyId
) => {
  const res = await api.get(
    `/payrollSetting/${clientCompanyId}`
  );
  return res.data;
};

export const createPayrollSetting = async (payload) => {
  const res = await api.post("/payrollSetting", payload);
  return res.data;
};

export const updatePayrollSetting = async (
  clientCompanyId,
  payload
) => {
  const res = await api.patch(
    `/payrollSetting/${clientCompanyId}`,
    payload
  );
  return res.data;
};
