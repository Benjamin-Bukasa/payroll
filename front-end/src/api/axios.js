import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/payroll/api",
  withCredentials: true, // cookies
});

export default api;
