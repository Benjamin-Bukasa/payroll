// src/store/clientCompanyImportStore.js
import { createImportStore } from "./importStoreFactory";
import { importEmployees } from "../api/importEmployee";

export const useEmployeeImportStore =
  createImportStore(importEmployees);
