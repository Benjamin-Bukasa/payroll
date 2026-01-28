// src/components/blocs/employees/EmployeeFilters.jsx
import React from "react";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";

const EmployeeFilters = ({ filters, onChange }) => {
  const clientCompanies = useClientCompanyStore(
    (s) => s.clientCompanies
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      
      {/* STATUS */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ status: e.target.value })
        }
        className="border rounded-md px-2 py-1 text-sm outline-none"
      >
        <option value="">Tous les statuts</option>
        <option value="ACTIF">Actif</option>
        <option value="INACTIF">Inactif</option>
        <option value="SUSPENDU">Suspendu</option>
      </select>

      {/* ENTREPRISE */}
      <select
        value={filters.companyId}
        onChange={(e) =>
          onChange({ companyId: e.target.value })
        }
        className="border rounded-md px-2 py-1 text-sm outline-none"
      >
        <option value="">Toutes les entreprises</option>
        {clientCompanies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.companyName}
          </option>
        ))}
      </select>

      {/* POSTE */}
      <input
        type="text"
        placeholder="Rechercher par poste"
        value={filters.position}
        onChange={(e) =>
          onChange({ position: e.target.value })
        }
        className="border rounded-md px-2 py-1 text-sm outline-none"
      />

      {/* NOM */}
      <input
        type="text"
        placeholder="Rechercher par nom"
        value={filters.search}
        onChange={(e) =>
          onChange({ search: e.target.value })
        }
        className="border rounded-md px-2 py-1 text-sm outline-none"
      />
    </div>
  );
};

export default EmployeeFilters;
