import { useEffect, useMemo, useState } from "react";
import { useClientCompanyStore } from "../../store/clientCompanyStore";
import { usePayrollPeriodStore } from "../../store/payrollPeriodStore";
import { useToastStore } from "../../store/toastStore";
import Button from "../ui/button";
import ConfirmModal from "../ui/confirmModal";
import Input from "../ui/input";

const formatPeriodDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const PayrollPeriodSchedule = () => {
  const {
    clientCompanies,
    loading: companyLoading,
    fetchError: companyError,
    fetchClientCompanies,
  } = useClientCompanyStore();
  const {
    periods,
    loading: periodsLoading,
    error: periodsError,
    creating: periodCreating,
    createError: periodCreateError,
    updating: periodUpdating,
    updateError: periodUpdateError,
    clearUpdateError,
    fetchPayrollPeriods,
    createPayrollPeriod,
    closePayrollPeriod,
    reopenPayrollPeriod,
  } = usePayrollPeriodStore();
  const addToast = useToastStore((s) => s.addToast);

  const [selectedCompanyId, setSelectedCompanyId] =
    useState("");
  const [periodForm, setPeriodForm] = useState({
    label: "",
    startDate: "",
    endDate: "",
  });
  const [applyAllCompanies, setApplyAllCompanies] =
    useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [actionPeriodId, setActionPeriodId] =
    useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPeriod, setPendingPeriod] = useState(null);

  useEffect(() => {
    fetchClientCompanies();
  }, [fetchClientCompanies]);

  useEffect(() => {
    if (!selectedCompanyId && clientCompanies.length > 0) {
      setSelectedCompanyId(clientCompanies[0].id);
    }
  }, [clientCompanies, selectedCompanyId]);

  useEffect(() => {
    if (!periodUpdateError) return;
    const lower = periodUpdateError.toLowerCase();
    const isForbidden =
      lower.includes("forbidden") ||
      lower.includes("unauthorized") ||
      lower.includes("access") ||
      lower.includes("droit");
    addToast({
      type: "error",
      message: isForbidden
        ? "Vous n'avez pas les droits pour cette action"
        : periodUpdateError,
    });
    clearUpdateError();
  }, [periodUpdateError, addToast, clearUpdateError]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPayrollPeriods({ clientCompanyId: selectedCompanyId });
    } else {
      fetchPayrollPeriods();
    }
  }, [fetchPayrollPeriods, selectedCompanyId]);

  const companyPeriods = useMemo(() => {
    if (!selectedCompanyId) return [];
    const scoped = periods.filter(
      (period) =>
        period.clientCompanyId === selectedCompanyId ||
        !period.clientCompanyId
    );
    if (!openOnly) return scoped;
    return scoped.filter((period) => !period.isClosed);
  }, [periods, selectedCompanyId, openOnly]);

  const buildPeriodLabel = (startValue, endValue) => {
    const start = formatPeriodDate(startValue);
    const end = formatPeriodDate(endValue);
    if (start === "-" || end === "-") return "";
    return `du ${start} au ${end}`;
  };

  const handleCreatePeriod = async () => {
    if (!applyAllCompanies && !selectedCompanyId) {
      addToast({
        type: "error",
        message: "Selectionnez une entreprise",
      });
      return;
    }

    if (!periodForm.startDate || !periodForm.endDate) {
      addToast({
        type: "error",
        message: "Selectionnez les dates",
      });
      return;
    }

    const start = new Date(periodForm.startDate);
    const end = new Date(periodForm.endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      addToast({
        type: "error",
        message: "Dates invalides",
      });
      return;
    }

    if (start > end) {
      addToast({
        type: "error",
        message: "La date debut doit etre avant la fin",
      });
      return;
    }

    const label =
      periodForm.label.trim() ||
      buildPeriodLabel(start, end);

    const created = await createPayrollPeriod({
      clientCompanyId: applyAllCompanies
        ? undefined
        : selectedCompanyId,
      applyAll: applyAllCompanies,
      label,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });

    if (created) {
      addToast({
        type: "success",
        message: "Periode de paie creee",
      });
      setPeriodForm({
        label: "",
        startDate: "",
        endDate: "",
      });
      setApplyAllCompanies(false);
      if (selectedCompanyId) {
        fetchPayrollPeriods({
          clientCompanyId: selectedCompanyId,
        });
      } else {
        fetchPayrollPeriods();
      }
    }
  };

  const handleTogglePeriod = async (period) => {
    if (!period?.id) return;
    setActionPeriodId(period.id);
    const action = period.isClosed
      ? reopenPayrollPeriod
      : closePayrollPeriod;
    const actionLabel = period.isClosed ? "rouverte" : "fermee";

    const updated = await action(period.id);
    if (updated) {
      addToast({
        type: "success",
        message: `Periode ${actionLabel} avec succes`,
      });
      if (selectedCompanyId) {
        fetchPayrollPeriods({
          clientCompanyId: selectedCompanyId,
        });
      } else {
        fetchPayrollPeriods();
      }
    } else {
      addToast({
        type: "error",
        message: "Impossible de modifier la periode",
      });
    }
    setActionPeriodId(null);
  };

  const handleRequestToggle = (period) => {
    setPendingPeriod(period);
    setConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!pendingPeriod) return;
    await handleTogglePeriod(pendingPeriod);
    setConfirmOpen(false);
    setPendingPeriod(null);
  };

  const handleCancelToggle = () => {
    setConfirmOpen(false);
    setPendingPeriod(null);
  };

  return (
    <section className="w-full grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
      <ConfirmModal
        open={confirmOpen}
        title={
          pendingPeriod?.isClosed
            ? "Rouvrir la periode"
            : "Fermer la periode"
        }
        description={
          pendingPeriod
            ? `${pendingPeriod.label} (${formatPeriodDate(
                pendingPeriod.startDate
              )} - ${formatPeriodDate(
                pendingPeriod.endDate
              )})`
            : ""
        }
        confirmLabel={
          pendingPeriod?.isClosed ? "Rouvrir" : "Fermer"
        }
        cancelLabel="Annuler"
        onConfirm={handleConfirmToggle}
        onClose={handleCancelToggle}
      />
      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700">
            Entreprises
          </h3>
          <span className="text-xs text-neutral-400">
            {clientCompanies.length}
          </span>
        </div>

        {companyLoading && (
          <p className="text-sm text-neutral-500">Chargement...</p>
        )}

        {companyError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {companyError}
          </div>
        )}

        <div className="space-y-2">
          {clientCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedCompanyId(company.id)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                selectedCompanyId === company.id
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              <p className="text-sm font-medium">
                {company.companyName || "Entreprise"}
              </p>
            </button>
          ))}

          {!companyLoading && clientCompanies.length === 0 && (
            <p className="text-xs text-neutral-500">
              Aucune entreprise trouvee.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-700">
              Periodes de paie
            </h3>
            <p className="text-xs text-neutral-400">
              {clientCompanies.find(
                (company) => company.id === selectedCompanyId
              )?.companyName || "Selectionnez une entreprise"}
            </p>
          </div>
        </div>

        {periodCreateError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {periodCreateError}
          </div>
        )}

        {periodUpdateError && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {periodUpdateError}
          </div>
        )}

        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-indigo-600">
              Creer une periode
            </h4>
            <p className="text-xs text-neutral-400">
              Entreprise selectionnee ou globale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Date debut"
              type="date"
              value={periodForm.startDate}
              onChange={(event) =>
                setPeriodForm((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
            />
            <Input
              label="Date fin"
              type="date"
              value={periodForm.endDate}
              onChange={(event) =>
                setPeriodForm((prev) => ({
                  ...prev,
                  endDate: event.target.value,
                }))
              }
            />
            <Input
              label="Libelle (optionnel)"
              type="text"
              placeholder="du 20/01/2024 au 20/02/2024"
              value={periodForm.label}
              onChange={(event) =>
                setPeriodForm((prev) => ({
                  ...prev,
                  label: event.target.value,
                }))
              }
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={applyAllCompanies}
              onChange={(event) =>
                setApplyAllCompanies(event.target.checked)
              }
            />
            Appliquer a toutes les entreprises
          </label>

          <div className="flex flex-wrap gap-2">
            <div className="max-w-[220px]">
              <Button
                type="button"
                buttonStyle
                className="py-2 rounded-lg"
                onClick={handleCreatePeriod}
                loading={periodCreating}
                disabled={!applyAllCompanies && !selectedCompanyId}
              >
                Creer une periode
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-neutral-700">
                Liste des periodes
              </h4>
              <p className="text-xs text-neutral-400">
                Ouvertes et fermees
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(event) => setOpenOnly(event.target.checked)}
                />
                Ouvertes uniquement
              </label>
              <span className="text-xs text-neutral-400">
                {companyPeriods.length}
              </span>
            </div>
          </div>

          {periodsLoading && (
            <p className="text-xs text-neutral-500">
              Chargement des periodes...
            </p>
          )}

          {periodsError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {periodsError}
            </div>
          )}

          <div className="space-y-2">
            {companyPeriods.map((period) => (
              <div
                key={period.id}
                className="flex items-center justify-between gap-3 text-xs border rounded-lg px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-neutral-700">
                    {period.label}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {formatPeriodDate(period.startDate)} - {" "}
                    {formatPeriodDate(period.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      period.isClosed
                        ? "bg-neutral-100 text-neutral-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {period.isClosed ? "Fermee" : "Ouverte"}
                  </span>
                  {!period.clientCompanyId && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      Global
                    </span>
                  )}
                  <button
                    type="button"
                    className="text-[11px] px-2 py-1 rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    onClick={() => handleRequestToggle(period)}
                    disabled={
                      periodUpdating || actionPeriodId === period.id
                    }
                  >
                    {period.isClosed ? "Rouvrir" : "Fermer"}
                  </button>
                </div>
              </div>
            ))}

            {!periodsLoading && companyPeriods.length === 0 && (
              <p className="text-xs text-neutral-500">
                Aucune periode pour cette entreprise.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PayrollPeriodSchedule;
