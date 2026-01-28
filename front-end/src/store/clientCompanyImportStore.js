// src/store/clientCompanyImportStore.js
import { createImportStore } from "./importStoreFactory";
import { importClientCompanies } from "../api/importClientCompany";

export const useClientCompanyImportStore =
  createImportStore(importClientCompanies);
