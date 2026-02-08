import api from "./axios";

export const getUsers = async () => {
  const res = await api.get("/user/getAll-users");
  return res.data;
};

export const createUser = async (payload) => {
  const res = await api.post("/user/create-user", payload);
  return res.data;
};

export const updateUser = async (userId, payload) => {
  const res = await api.patch(`/user/${userId}`, payload);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/user/${userId}`);
  return res.data;
};
