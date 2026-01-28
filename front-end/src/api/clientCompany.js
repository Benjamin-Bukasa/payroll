import api from "./axios";

export const createClientCompany = async (payload) => {
  const res = await api.post(
    "/clientCompany/create",
    payload
  );
  return res.data;
};

export const getClientCompanies = async () => {
  const res = await api.get("/clientCompany/getall");
  return res.data;
};

export const getClientCompanyById = async (clientCompanyId) => {
  const res = await api.get(`/clientCompany/${clientCompanyId}`);
  return res.data;
};

export const updateClientCompany = async (clientCompanyId, payload) => {
  const res = await api.patch(
    `/clientCompany/${clientCompanyId}`,
    payload
  );
  return res.data;
};  

export const importClientCompanies = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    "/clientCompany/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};


export const downloadClientCompanyTemplate = async () => {
  const res = await api.get(
    "/clientCompany/template/excel",
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "client_company_template.xlsx";
  a.click();
};
