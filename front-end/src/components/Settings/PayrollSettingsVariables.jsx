import { useEffect, useMemo, useState } from "react";
import { usePayrollSettingStore } from "../../store/payrollSettingStore";
import { useClientCompanyStore } from "../../store/clientCompanyStore";
import { useToastStore } from "../../store/toastStore";
import Button from "../ui/button";
import ConfirmModal from "../ui/confirmModal";
import Input from "../ui/input";
import ScrollArea from "../ui/scroll-area";

const formatNumber = (value, maxFractionDigits = 2) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
};

const formatRate = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${formatNumber(value * 100, 2)}%`;
};

const formatBoolean = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return value ? "Oui" : "Non";
};

const InfoItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[11px] uppercase tracking-wide text-neutral-400">
      {label}
    </p>
    <p className="text-sm text-neutral-800">{value}</p>
  </div>
);

const fieldGroups = [
  {
    title: "Salaire & Allocations",
    fields: [
      {
        name: "housingRate",
        label: "Taux logement",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "maxChildrenAllowance",
        label: "Enfants max",
        kind: "integer",
        step: "1",
      },
      {
        name: "familyAllowanceDivider",
        label: "Diviseur allocation familiale",
        kind: "integer",
        step: "1",
      },
      {
        name: "medicalAllowance",
        label: "Soins médicaux",
        kind: "number",
        step: "0.01",
      },
    ],
  },
  {
    title: "Transport",
    fields: [
      {
        name: "taxiFare",
        label: "Prix course taxi",
        kind: "number",
        step: "0.01",
      },
      {
        name: "taxiCoursesPerDay",
        label: "Courses/jour",
        kind: "integer",
        step: "1",
      },
    ],
  },
  {
    title: "Déductions Employé",
    fields: [
      {
        name: "cnssQPORate",
        label: "CNSS QPO",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "iprReductionRate",
        label: "IPR réduction",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "iprMaxChildren",
        label: "IPR max enfants",
        kind: "integer",
        step: "1",
      },
      {
        name: "defaultUnionFee",
        label: "Cotisation syndicale",
        kind: "number",
        step: "0.01",
      },
      {
        name: "allowSalaryAdvance",
        label: "Avance salariale",
        kind: "boolean",
      },
    ],
  },
  {
    title: "Expatrié / Secteur",
    fields: [
      {
        name: "isMiningSector",
        label: "Secteur minier",
        kind: "boolean",
      },
      {
        name: "miningSectorMaxYears",
        label: "Années max secteur minier",
        kind: "integer",
        step: "1",
      },
      {
        name: "iereRate",
        label: "IERE",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "iereMiningRate",
        label: "IERE minier",
        kind: "rate",
        step: "0.001",
      },
    ],
  },
  {
    title: "Charges Employeur",
    fields: [
      {
        name: "cnssRiskEmployerRate",
        label: "CNSS risque",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "cnssRetirementRate",
        label: "CNSS retraite",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "cnssFamilyRate",
        label: "CNSS famille",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "onemRate",
        label: "ONEM",
        kind: "rate",
        step: "0.0001",
      },
      {
        name: "inppRateSmall",
        label: "INPP (0-50)",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "inppRateMedium",
        label: "INPP (51-300)",
        kind: "rate",
        step: "0.001",
      },
      {
        name: "inppRateLarge",
        label: "INPP (>300)",
        kind: "rate",
        step: "0.001",
      },
    ],
  },
];

const defaultPayrollSettingValues = {
  housingRate: 0.3,
  maxChildrenAllowance: 9,
  familyAllowanceDivider: 27,
  taxiFare: 0,
  taxiCoursesPerDay: 6,
  medicalAllowance: 0,
  cnssQPORate: 0.05,
  iprReductionRate: 0.02,
  iprMaxChildren: 9,
  defaultUnionFee: 0,
  allowSalaryAdvance: true,
  isMiningSector: false,
  miningSectorMaxYears: 11,
  iereRate: 0.25,
  iereMiningRate: 0.125,
  cnssRiskEmployerRate: 0.015,
  cnssRetirementRate: 0.05,
  cnssFamilyRate: 0.065,
  onemRate: 0.0005,
  inppRateSmall: 0.03,
  inppRateMedium: 0.02,
  inppRateLarge: 0.01,
};

const getDisplayValue = (field, setting) => {
  const value = setting?.[field.name];
  if (field.kind === "rate") {
    return formatRate(value);
  }
  if (field.kind === "integer") {
    return formatNumber(value, 0);
  }
  if (field.kind === "boolean") {
    return formatBoolean(value);
  }
  return formatNumber(value);
};

const getInitialValues = (setting, fallbackValues = {}) => {
  const values = {};
  fieldGroups.forEach((group) => {
    group.fields.forEach((field) => {
      const fallbackValue = fallbackValues[field.name];
      const rawValue =
        setting?.[field.name] !== undefined &&
        setting?.[field.name] !== null
          ? setting[field.name]
          : fallbackValue;

      if (field.kind === "boolean") {
        values[field.name] = Boolean(rawValue);
      } else {
        values[field.name] =
          rawValue === undefined || rawValue === null
            ? ""
            : rawValue;
      }
    });
  });
  return values;
};

const buildPayload = (values) => {
  const payload = {};
  fieldGroups.forEach((group) => {
    group.fields.forEach((field) => {
      const value = values[field.name];
      if (field.kind === "boolean") {
        if (value !== undefined) {
          payload[field.name] = Boolean(value);
        }
        return;
      }
      if (value === "" || value === undefined) {
        return;
      }
      payload[field.name] = value;
    });
  });
  return payload;
};

const PayrollSettingsVariables = () => {
  const {
    settings,
    selectedSetting,
    loading,
    error,
    detailsLoading,
    detailsError,
    saving,
    saveError,
    fetchPayrollSettings,
    fetchPayrollSettingByClientCompany,
    createPayrollSetting,
    updatePayrollSetting,
    clearErrors,
  } = usePayrollSettingStore();

  const addToast = useToastStore((s) => s.addToast);

  const {
    clientCompanies,
    loading: companyLoading,
    fetchError: companyError,
    fetchClientCompanies,
  } = useClientCompanyStore();

  const [selectedCompanyId, setSelectedCompanyId] =
    useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCompanyId, setPendingCompanyId] =
    useState(null);

  useEffect(() => {
    fetchClientCompanies();
    fetchPayrollSettings();
  }, [fetchClientCompanies, fetchPayrollSettings]);

  useEffect(() => {
    if (!selectedCompanyId && clientCompanies.length > 0) {
      setSelectedCompanyId(clientCompanies[0].id);
    }
  }, [clientCompanies, selectedCompanyId]);

  const configuredCompanyIds = useMemo(
    () => new Set(settings.map((s) => s.clientCompanyId)),
    [settings]
  );

  const selectedCompany = useMemo(() => {
    return clientCompanies.find(
      (company) => company.id === selectedCompanyId
    );
  }, [clientCompanies, selectedCompanyId]);

  const hasSetting =
    selectedCompanyId &&
    configuredCompanyIds.has(selectedCompanyId);

  useEffect(() => {
    if (!selectedCompanyId) {
      fetchPayrollSettingByClientCompany(null);
      return;
    }

    if (hasSetting) {
      fetchPayrollSettingByClientCompany(selectedCompanyId);
    } else {
      fetchPayrollSettingByClientCompany(null);
    }
  }, [
    selectedCompanyId,
    hasSetting,
    fetchPayrollSettingByClientCompany,
  ]);

  useEffect(() => {
    if (selectedSetting) {
      setFormValues(getInitialValues(selectedSetting));
    } else {
      setFormValues(
        getInitialValues(null, defaultPayrollSettingValues)
      );
    }
    setIsEditing(false);
  }, [selectedSetting, selectedCompanyId]);


  const handleSelect = (clientCompanyId) => {
    if (clientCompanyId === selectedCompanyId) {
      return;
    }

    if (isEditing) {
      setPendingCompanyId(clientCompanyId);
      setConfirmOpen(true);
      return;
    }

    setSelectedCompanyId(clientCompanyId);
    clearErrors();
  };

  const handleConfirmCompanyChange = () => {
    setConfirmOpen(false);
    setIsEditing(false);
    setSelectedCompanyId(pendingCompanyId);
    setPendingCompanyId(null);
    clearErrors();
  };

  const handleCancelCompanyChange = () => {
    setConfirmOpen(false);
    setPendingCompanyId(null);
  };

  const handleCreate = async () => {
    if (!selectedCompanyId) {
      return;
    }

    clearErrors();
    const payload = buildPayload(formValues);
    const created = await createPayrollSetting({
      clientCompanyId: selectedCompanyId,
      ...payload,
    });

    if (created) {
      await fetchPayrollSettings();
      await fetchPayrollSettingByClientCompany(
        selectedCompanyId
      );
      addToast({
        type: "success",
        message: "Variables de paie creees avec succes",
      });
    }
  };

  const handleSave = async () => {
    if (!selectedCompanyId) {
      return;
    }

    clearErrors();
    const payload = buildPayload(formValues);
    if (Object.keys(payload).length === 0) {
      return;
    }

    const updated = await updatePayrollSetting(
      selectedCompanyId,
      payload
    );

    if (updated) {
      await fetchPayrollSettings();
      await fetchPayrollSettingByClientCompany(
        selectedCompanyId
      );
      setIsEditing(false);
      addToast({
        type: "success",
        message: "Variables de paie mises a jour",
      });
    }
  };

  const handleReset = () => {
    setFormValues(getInitialValues(selectedSetting));
    setIsEditing(false);
  };

  

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        title="Quitter sans enregistrer"
        description="Vous quittez sans enregistrer vos modifications. Continuer ?"
        confirmLabel="Quitter"
        cancelLabel="Rester"
        onConfirm={handleConfirmCompanyChange}
        onClose={handleCancelCompanyChange}
      />
      <div className="w-full h-full min-h-0 grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
      <div className="bg-white border rounded-lg p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">
            Entreprises
          </h3>
          <span className="text-xs text-neutral-400">
            {clientCompanies.length}
          </span>
        </div>

        <ScrollArea className="flex-1 min-h-0 p-1 border-none">
          <div className="space-y-3 pr-1">
        {companyLoading && (
          <p className="text-sm text-neutral-500">
            Chargement...
          </p>
        )}

        {companyError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {companyError}
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {clientCompanies.map((company) => {
            const configured = configuredCompanyIds.has(
              company.id
            );
            return (
              <button
                key={company.id}
                onClick={() => handleSelect(company.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                  selectedCompanyId === company.id
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <p className="text-sm font-medium">
                  {company.companyName || "Entreprise"}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {configured
                    ? "Configuré"
                    : "Non configuré"}
                </p>
              </button>
            );
          })}

          {!companyLoading &&
            clientCompanies.length === 0 && (
              <p className="text-xs text-neutral-500">
                Aucune entreprise trouvée.
              </p>
            )}
        </div>
          </div>
        </ScrollArea>
      </div>

      <div className="bg-white border rounded-lg p-4 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="pb-2">
            <h3 className="text-sm font-semibold text-neutral-700">
              Variables de paie
            </h3>
            <p className="text-xs text-neutral-400">
              {selectedCompany?.companyName ||
                "Sélectionnez une entreprise"}
            </p>
          </div>

        {clientCompanies.length > 0 && (
            <select
              className="text-sm  rounded-md px-2 py-1"
              value={selectedCompanyId}
              onChange={(e) => handleSelect(e.target.value)}
            >
              {clientCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName || company.id}
                </option>
              ))}
            </select>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 pr-2">
        {saveError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {saveError}
          </div>
        )}

        {detailsLoading && (
          <p className="text-sm text-neutral-500">
            Chargement des détails...
          </p>
        )}

        {detailsError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {detailsError}
          </div>
        )}

        {!loading &&
          !detailsLoading &&
          !detailsError &&
          !hasSetting &&
          selectedCompanyId && (
            <div className=" rounded-lg p-4 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-indigo-600">
                  Creer avec valeurs personnalisees
                </h4>
                <p className="text-sm text-neutral-600">
                  Renseignez les valeurs puis cliquez sur
                  Creer.
                </p>
              </div>

              {fieldGroups.map((section) => (
                <div
                  key={section.title}
                  className="rounded-lg p-4 space-y-4 bg-neutral-50"
                >
                  <h4 className="text-sm font-semibold text-indigo-600">
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {section.fields.map((field) => (
                      <div key={field.name}>
                        {field.kind === "boolean" ? (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(
                                formValues[field.name]
                              )}
                              onChange={(e) =>
                                setFormValues((prev) => ({
                                  ...prev,
                                  [field.name]:
                                    e.target.checked,
                                }))
                              }
                            />
                            {field.label}
                          </label>
                        ) : (
                          <Input
                            label={field.label}
                            type="number"
                            step={field.step}
                            value={formValues[field.name]}
                            onChange={(e) =>
                              setFormValues((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 p-2">
                <div className="max-w-[220px]">
                  <Button
                    type="button"
                    buttonStyle
                    className="py-2 rounded-lg"
                    onClick={handleCreate}
                    loading={saving}
                  >
                    Creer
                  </Button>
                </div>
                <div className="max-w-[220px]">
                  <Button
                    type="button"
                    className="py-2 rounded-lg"
                    onClick={handleReset}
                  >
                    Reinitialiser
                  </Button>
                </div>
              </div>
            </div>
          )}

        {!detailsLoading &&
          !detailsError &&
          selectedSetting && (
            <div className="space-y-4 p-2">
              <div className="flex flex-wrap gap-2">
                {!isEditing && (
                  <div className="max-w-[220px]">
                    <Button
                      type="button"
                      buttonStyle
                      className="px-4 py-2 rounded-lg"
                      onClick={() => setIsEditing(true)}
                    >
                      Modifier
                    </Button>
                  </div>
                )}

                {isEditing && (
                  <>
                    <div className="max-w-[220px]">
                      <Button
                        type="button"
                        buttonStyle
                        className="px-4 py-2 rounded-lg"
                        onClick={handleSave}
                        loading={saving}
                      >
                        Enregistrer
                      </Button>
                    </div>
                    <div className="max-w-[220px]">
                      <Button
                        type="button"
                        className="px-4 py-2 rounded-lg"
                        onClick={handleReset}
                      >
                        Annuler
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {fieldGroups.map((section) => (
                <div
                  key={section.title}
                  className="rounded-lg p-4 space-y-4 bg-neutral-50"
                >
                  <h4 className="text-sm font-semibold text-indigo-600">
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {section.fields.map((field) => (
                      <div key={field.name}>
                        {isEditing ? (
                          field.kind === "boolean" ? (
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={Boolean(
                                  formValues[field.name]
                                )}
                                onChange={(e) =>
                                  setFormValues((prev) => ({
                                    ...prev,
                                    [field.name]:
                                      e.target.checked,
                                  }))
                                }
                              />
                              {field.label}
                            </label>
                          ) : (
                            <Input
                              label={field.label}
                              type="number"
                              step={field.step}
                              value={formValues[field.name]}
                              onChange={(e) =>
                                setFormValues((prev) => ({
                                  ...prev,
                                  [field.name]: e.target.value,
                                }))
                              }
                            />
                          )
                        ) : (
                          <InfoItem
                            label={field.label}
                            value={getDisplayValue(
                              field,
                              selectedSetting
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

        {!selectedCompanyId && (
          <p className="text-sm text-neutral-500">
            Sélectionnez une entreprise pour afficher les
            variables.
          </p>
        )}
          </div>
        </ScrollArea>
      </div>
      </div>
    </>
  );
};

export default PayrollSettingsVariables;
