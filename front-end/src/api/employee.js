import api from "./axios";

export const getEmployees = async () => {
  const res = await api.get("/employee");
  return res.data;
};

export const createEmployee = async (data) => {
  const res = await api.post("/employee/create", data);
  return res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await api.patch(`/employee/${id}`, data);
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`/employee/${id}`);
  return res.data;
};
