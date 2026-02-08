import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";
import Input from "../ui/input";
import Button from "../ui/button";
import ConfirmModal from "../ui/confirmModal";
import ScrollArea from "../ui/scroll-area";
import {
  getCompanyMe,
  updateCompanyMe,
  updateCompanyLogo,
} from "../../api/company";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/adminUsers";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

const SECTOR_OPTIONS = [
  { value: "GENERAL", label: "General" },
  { value: "MINING", label: "Mining" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "INDUSTRY", label: "Industry" },
  { value: "SERVICES", label: "Services" },
  { value: "CONSTRUCTION", label: "Construction" },
];

const CompanySettings = () => {
  const addToast = useToastStore((s) => s.addToast);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const currentUser = useAuthStore((s) => s.user);

  const [company, setCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    idNat: "",
    rccm: "",
    numImpot: "",
    sector: "GENERAL",
    devise: "CDF",
  });
  const [companyLoading, setCompanyLoading] =
    useState(true);
  const [companySaving, setCompanySaving] =
    useState(false);
  const [logoUploading, setLogoUploading] =
    useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] =
    useState(true);
  const [creatingUser, setCreatingUser] =
    useState(false);
  const [editingUserId, setEditingUserId] =
    useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] =
    useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const [userForm, setUserForm] = useState({
    firstname: "",
    lastname: "",
    familyname: "",
    position: "",
    email: "",
    role: "USER",
  });

  const [editUserForm, setEditUserForm] =
    useState({
      firstname: "",
      lastname: "",
      familyname: "",
      position: "",
      email: "",
      role: "USER",
      isActive: true,
    });

  const canManageUsers = useMemo(
    () =>
      ["ADMIN", "SUPER_ADMIN"].includes(
        currentUser?.role
      ),
    [currentUser?.role]
  );

  const limitReached = useMemo(() => {
    if (!company) return false;
    if (company.unlimitedUsers) return false;
    if (company.planLimit === null) return false;
    return company.userCount >= (company.planLimit || 0);
  }, [company]);

  const subscriptionInactive = useMemo(() => {
    if (!company?.subscription) return true;
    return !company.subscription.isActive;
  }, [company]);

  const formatDate = (value) => {
    if (!value) return "Illimite";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadCompany = async () => {
    try {
      setCompanyLoading(true);
      const data = await getCompanyMe();
      setCompany(data);
      setCompanyForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        idNat: data.idNat || "",
        rccm: data.rccm || "",
        numImpot: data.numImpot || "",
        sector: data.sector || "GENERAL",
        devise: data.devise || "CDF",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de charger la societe",
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de charger les utilisateurs",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
    loadUsers();
  }, []);

  const handleCompanyInputChange = (field) => (e) => {
    setCompanyForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSaveCompany = async () => {
    try {
      setCompanySaving(true);
      await updateCompanyMe(companyForm);
      await loadCompany();
      await fetchMe();
      addToast({
        type: "success",
        message: "Societe mise a jour",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de mettre a jour la societe",
      });
    } finally {
      setCompanySaving(false);
    }
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast({
        type: "error",
        message: "Veuillez choisir une image",
      });
      event.target.value = "";
      return;
    }

    try {
      setLogoUploading(true);
      await updateCompanyLogo(file);
      await loadCompany();
      await fetchMe();
      addToast({
        type: "success",
        message: "Logo mis a jour",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de mettre a jour le logo",
      });
    } finally {
      setLogoUploading(false);
      event.target.value = "";
    }
  };

  const handleUserFormChange = (field) => (e) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleEditFormChange = (field) => (e) => {
    setEditUserForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleCreateUser = async () => {
    if (!userForm.firstname || !userForm.lastname || !userForm.email) {
      addToast({
        type: "error",
        message: "Nom, prenom et email sont requis",
      });
      return;
    }

    try {
      setCreatingUser(true);
      await createUser(userForm);
      setUserForm({
        firstname: "",
        lastname: "",
        familyname: "",
        position: "",
        email: "",
        role: "USER",
      });
      await loadUsers();
      await loadCompany();
      addToast({
        type: "success",
        message: "Utilisateur cree",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de creer l'utilisateur",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleStartEdit = (userRow) => {
    setEditingUserId(userRow.id);
    setEditUserForm({
      firstname: userRow.firstname || "",
      lastname: userRow.lastname || "",
      familyname: userRow.familyname || "",
      position: userRow.position || "",
      email: userRow.email || "",
      role: userRow.role || "USER",
      isActive: userRow.isActive,
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUserId) return;
    try {
      await updateUser(editingUserId, {
        firstname: editUserForm.firstname,
        lastname: editUserForm.lastname,
        familyname: editUserForm.familyname,
        position: editUserForm.position,
        role: editUserForm.role,
        isActive: editUserForm.isActive,
      });
      await loadUsers();
      setEditingUserId(null);
      addToast({
        type: "success",
        message: "Utilisateur mis a jour",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de mettre a jour l'utilisateur",
      });
    }
  };

  const handleToggleUser = async (userRow) => {
    try {
      await updateUser(userRow.id, {
        isActive: !userRow.isActive,
      });
      await loadUsers();
      addToast({
        type: "success",
        message: "Statut utilisateur mis a jour",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de mettre a jour le statut",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!targetUser) return;
    try {
      await deleteUser(targetUser.id);
      setConfirmDeleteOpen(false);
      setTargetUser(null);
      await loadUsers();
      await loadCompany();
      addToast({
        type: "success",
        message: "Utilisateur supprime",
      });
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de supprimer l'utilisateur",
      });
    }
  };

  const formatPlanLimit = (limit, unlimited) => {
    if (unlimited) return "Illimite";
    return limit ?? 0;
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <ConfirmModal
        open={confirmDeleteOpen}
        title="Supprimer un utilisateur"
        description={`Supprimer ${targetUser?.firstname || ""} ${
          targetUser?.lastname || ""
        } ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleDeleteUser}
        onClose={() => setConfirmDeleteOpen(false)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-4">
        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Informations societe
              </p>
              <p className="text-xs text-neutral-400">
                Configuration SaaS
              </p>
            </div>
          </div>

          {companyLoading ? (
            <p className="text-sm text-neutral-500">
              Chargement...
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                  {company?.logo ? (
                    <img
                      src={company.logo}
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "LOGO"
                  )}
                </div>
                <label className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer">
                  {logoUploading ? "Chargement..." : "Changer logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={logoUploading}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom"
                  value={companyForm.name}
                  onChange={handleCompanyInputChange("name")}
                />
                <Input
                  label="Email"
                  value={companyForm.email}
                  onChange={handleCompanyInputChange("email")}
                />
                <Input
                  label="Telephone"
                  value={companyForm.phone}
                  onChange={handleCompanyInputChange("phone")}
                />
                <Input
                  label="Adresse"
                  value={companyForm.address}
                  onChange={handleCompanyInputChange("address")}
                />
                <Input
                  label="ID NAT"
                  value={companyForm.idNat}
                  onChange={handleCompanyInputChange("idNat")}
                />
                <Input
                  label="RCCM"
                  value={companyForm.rccm}
                  onChange={handleCompanyInputChange("rccm")}
                />
                <Input
                  label="Numero impot"
                  value={companyForm.numImpot}
                  onChange={handleCompanyInputChange("numImpot")}
                />
                <div className="w-full flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Secteur
                  </label>
                  <select
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                    value={companyForm.sector}
                    onChange={handleCompanyInputChange(
                      "sector"
                    )}
                  >
                    {SECTOR_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Devise
                  </label>
                  <select
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                    value={companyForm.devise}
                    onChange={handleCompanyInputChange(
                      "devise"
                    )}
                  >
                    <option value="CDF">CDF</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  buttonStyle
                  className="px-4 py-2 rounded-lg"
                  onClick={handleSaveCompany}
                  loading={companySaving}
                >
                  Enregistrer
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-neutral-800">
            Abonnement
          </p>
          {companyLoading ? (
            <p className="text-sm text-neutral-500">
              Chargement...
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Plan</span>
                <span className="font-medium text-neutral-800">
                  {company?.subscription?.plan || "Aucun"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Debut</span>
                <span className="font-medium text-neutral-800">
                  {formatDate(company?.subscription?.startDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Fin</span>
                <span className="font-medium text-neutral-800">
                  {formatDate(company?.subscription?.endDate)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Statut</span>
                <span
                  className={`font-medium ${
                    company?.subscription?.isActive
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {company?.subscription?.isActive
                    ? "Actif"
                    : "Inactif"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  Utilisateurs
                </span>
                <span className="font-medium text-neutral-800">
                  {company?.userCount || 0} /{" "}
                  {formatPlanLimit(
                    company?.planLimit,
                    company?.unlimitedUsers
                  )}
                </span>
              </div>
              {limitReached && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  Limite d'utilisateurs atteinte
                </p>
              )}
              {subscriptionInactive && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  Abonnement inactif
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Utilisateurs
            </p>
            <p className="text-xs text-neutral-400">
              Gestion des roles et acces
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <Input
            label="Prenom"
            value={userForm.firstname}
            onChange={handleUserFormChange("firstname")}
          />
          <Input
            label="Postnom"
            value={userForm.familyname}
            onChange={handleUserFormChange("familyname")}
          />
          <Input
            label="Nom"
            value={userForm.lastname}
            onChange={handleUserFormChange("lastname")}
          />
          <Input
            label="Poste"
            value={userForm.position}
            onChange={handleUserFormChange("position")}
          />
          <Input
            label="Email"
            value={userForm.email}
            onChange={handleUserFormChange("email")}
          />
          <div className="w-full flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">
              Role
            </label>
            <select
              className="px-3 py-2 rounded-md border border-gray-300 text-sm"
              value={userForm.role}
              onChange={handleUserFormChange("role")}
            >
              {ROLE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            buttonStyle
            className="px-4 py-2 rounded-lg"
            onClick={handleCreateUser}
            loading={creatingUser}
            disabled={
              !canManageUsers ||
              limitReached ||
              subscriptionInactive
            }
          >
            Creer utilisateur
          </Button>
          {!canManageUsers && (
            <p className="text-xs text-red-600">
              Acces reserve aux admins
            </p>
          )}
        </div>

        {editingUserId && (
          <div className="border rounded-lg p-3 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <Input
                label="Prenom"
                value={editUserForm.firstname}
                onChange={handleEditFormChange(
                  "firstname"
                )}
              />
              <Input
                label="Postnom"
                value={editUserForm.familyname}
                onChange={handleEditFormChange(
                  "familyname"
                )}
              />
              <Input
                label="Nom"
                value={editUserForm.lastname}
                onChange={handleEditFormChange(
                  "lastname"
                )}
              />
              <Input
                label="Poste"
                value={editUserForm.position}
                onChange={handleEditFormChange(
                  "position"
                )}
              />
              <div className="w-full flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Role
                </label>
                <select
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                  value={editUserForm.role}
                  onChange={handleEditFormChange("role")}
                  disabled={
                    editUserForm.role === "SUPER_ADMIN"
                  }
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Statut
                </label>
                <select
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                  value={
                    editUserForm.isActive ? "1" : "0"
                  }
                  onChange={(event) =>
                    setEditUserForm((prev) => ({
                      ...prev,
                      isActive: event.target.value === "1",
                    }))
                  }
                >
                  <option value="1">Actif</option>
                  <option value="0">Inactif</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <Button
                buttonStyle
                className="px-4 py-2 rounded-lg"
                onClick={handleSaveEdit}
              >
                Enregistrer
              </Button>
              <Button
                buttonStyle={false}
                className="px-4 py-2 rounded-lg"
                onClick={handleCancelEdit}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <table className="w-full text-[12px]">
              <thead className="bg-neutral-50 border-b">
                <tr>
                  <th className="px-3 py-3 text-left">
                    Nom
                  </th>
                  <th className="px-3 py-3 text-left">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left">
                    Role
                  </th>
                  <th className="px-3 py-3 text-left">
                    Statut
                  </th>
                  <th className="px-3 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-neutral-500"
                    >
                      Chargement...
                    </td>
                  </tr>
                )}

                {!usersLoading &&
                  users.map((userRow) => (
                    <tr
                      key={userRow.id}
                      className="border-b"
                    >
                      <td className="px-3 py-3">
                        <div className="text-[12px] font-medium text-neutral-800">
                          {userRow.firstname}{" "}
                          {userRow.familyname}{" "}
                          {userRow.lastname}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {userRow.position || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {userRow.email}
                      </td>
                      <td className="px-3 py-3">
                        {userRow.role}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full ${
                            userRow.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {userRow.isActive
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            buttonStyle={false}
                            className="px-3 py-1 rounded-lg text-[11px]"
                            onClick={() =>
                              handleStartEdit(userRow)
                            }
                            disabled={
                              userRow.role === "SUPER_ADMIN"
                            }
                          >
                            Modifier
                          </Button>
                          <Button
                            buttonStyle={false}
                            className="px-3 py-1 rounded-lg text-[11px]"
                            onClick={() =>
                              handleToggleUser(userRow)
                            }
                            disabled={
                              userRow.role === "SUPER_ADMIN" ||
                              userRow.id === currentUser?.id
                            }
                          >
                            {userRow.isActive
                              ? "Desactiver"
                              : "Activer"}
                          </Button>
                          <Button
                            buttonStyle={false}
                            className="px-3 py-1 rounded-lg text-[11px] text-red-600"
                            onClick={() => {
                              setTargetUser(userRow);
                              setConfirmDeleteOpen(true);
                            }}
                            disabled={
                              userRow.role === "SUPER_ADMIN" ||
                              userRow.id === currentUser?.id
                            }
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {!usersLoading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-6 text-center text-neutral-400"
                    >
                      Aucun utilisateur
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
