import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientCompanyStore } from "../../../store/clientCompanyStore";
import ClientCompanyActions from "./ClientCompanyActions";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const ClientCompanyTable = () => {
  // ✅ TOUS LES HOOKS EN HAUT (OBLIGATOIRE)
  const [selected, setSelected] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  const navigate = useNavigate();

  const {
    clientCompanies,
    loading,
    fetchError,
    fetchClientCompanies,
  } = useClientCompanyStore();

  useEffect(() => {
    fetchClientCompanies();
  }, [fetchClientCompanies]);

  /* ===============================
     RENDER
  =============================== */

  if (loading) {
    return <p className="text-sm">Chargement...</p>;
  }

  return (
    <div className="h-full bg-white overflow-hidden ">
      {/* ✅ ERREUR LISTE (PAS DE RETURN) */}
      {fetchError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded mb-3">
          {fetchError}
        </div>
      )}

      <table className="w-full text-[12px]">
        <thead className="bg-neutral-50 border-b font-medium">
          <tr>
            <th className="px-4 py-3 text-left">Entreprise</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Employés</th>
            <th className="px-4 py-3 text-left">Secteur</th>
            <th className="px-4 py-3 text-left">Adresse</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {clientCompanies.map((company) => (
            <tr
              key={company.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold">
                    {company.companyName?.charAt(0)}
                  </div>
                  <span>{company.companyName}</span>
                </div>
              </td>

              <td className="px-4 py-3">
                {company.email || "-"}
              </td>

              <td className="px-4 py-3 text-center">
                <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-xs font-medium">
                  {company._count?.employees ?? 0}
                </span>
              </td>

              <td className="px-4 py-3">
                {company.activitySector}
              </td>

              <td className="px-4 py-3">
                {company.address}
              </td>

              <td className="px-4 py-3 text-right">
                <ClientCompanyActions
                  company={{
                    ...company,
                    canView: true,
                    canEdit: true,
                    canDelete: true,
                  }}
                  onView={(c) =>
                    navigate(`/client-companies/${c.id}`)
                  }
                  onEdit={(c) =>
                    navigate(`/client-companies/${c.id}/edit`)
                  }
                  onDelete={(c) => {
                    setSelected(c);
                    setOpenDelete(true);
                  }}
                />
              </td>
            </tr>
          ))}

          {clientCompanies.length === 0 && !fetchError && (
            <tr>
              <td
                colSpan="6"
                className="text-center py-6 text-gray-400"
              >
                Aucune entreprise cliente trouvée
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmDeleteModal
        open={openDelete}
        title="Supprimer l’entreprise cliente"
        description={`Voulez-vous vraiment supprimer "${selected?.companyName}" ?`}
        onClose={() => setOpenDelete(false)}
        onConfirm={() => console.log("DELETE", selected?.id)}
      />
    </div>
  );
};

export default ClientCompanyTable;
