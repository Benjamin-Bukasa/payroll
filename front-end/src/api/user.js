import api from "./axios";

export const updateMyProfile = async (payload) => {
  const res = await api.patch("/user/me", payload);
  return res.data;
};

export const updateMyAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.patch("/user/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const deleteMyAccount = async () => {
  const res = await api.delete("/user/me");
  return res.data;
};

export const changeMyPassword = async (payload) => {
  const res = await api.patch("/auth/change-password", payload);
  return res.data;
};
