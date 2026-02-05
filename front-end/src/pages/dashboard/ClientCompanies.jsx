import React from "react";
import CreateClientCompanyForm from "../../components/blocs/Companies/CreateClientCompanyForm";
import ScrollArea from "../../components/ui/scroll-area";
import ImportClientCompanyForm from "../../components/blocs/Companies/ImportClientCompanyForm";
import ClientCompanyTable from "../../components/blocs/Companies/ClientCompanyTable";
import ClientCompanySummary from "../../components/blocs/Companies/ClientCompanySummary";
import ClientCompanyBySectorDonut from "../../components/blocs/Companies/ClientCompanyBySectorDonut";

function ClientCompanies() {
  return (
    <div className="h-full flex flex-col xl:flex-row gap-4 p-4">
      
      {/* ===== GAUCHE ===== */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4 ">
        
        <ClientCompanySummary />

        <ScrollArea className="xl:h-[680px]">
          <div className="sticky top-0 z-10 bg-white border-b py-3 px-4">
            <h3 className="text-lg font-semibold">
              Toutes les entreprises clientes
            </h3>
          </div>
          <ClientCompanyTable />
        </ScrollArea>
      </div>

      {/* ===== DROITE ===== */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* CREATE */}
        <div className="rounded-lg border p-3">
          <h3 className="text-lg font-semibold pb-2 mb-3 border-b text-indigo-600">
            Ajouter une entreprise
          </h3>
          <CreateClientCompanyForm/>
        </div>
        {/* IMPORT */}
        <div className="rounded-lg border p-3">
          <h3 className="text-lg font-semibold pb-2 mb-3 border-b text-indigo-600">
            Importer des entreprises
          </h3>
          <ImportClientCompanyForm />
        </div>
      </div>
    </div>
  );
}

export default ClientCompanies;
