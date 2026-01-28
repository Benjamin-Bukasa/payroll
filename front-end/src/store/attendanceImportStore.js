// src/store/clientCompanyImportStore.js
import { createImportStore } from "./importStoreFactory";
import { importEmployeeAttendances } from "../api/importAttendance";

export const useEmployeeAttendanceImportStore =
  createImportStore(importEmployeeAttendances);
