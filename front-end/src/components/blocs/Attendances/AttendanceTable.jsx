import Badge from "../../ui/badge";
import { useAttendanceStore } from "../../../store/attendanceStore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/input";
import ConfirmModal from "../../ui/confirmModal";
import {
  deleteAttendance,
  updateAttendance,
} from "../../../api/attendance";
import { useToastStore } from "../../../store/toastStore";
import AttendanceActions from "./AttendanceActions";

const AttendanceTable = ({
  filters,
  sortBy = "date",
  sortDir = "desc",
  embedded = false,
}) => {
  const navigate = useNavigate();
  const {
    attendancesTable,
    tableError,
    tableLoading,
    fetchAttendancesTable,
  } = useAttendanceStore();
  const addToast = useToastStore((s) => s.addToast);

  const [selectedIds, setSelectedIds] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] =
    useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const queryParams = useMemo(() => {
    const params = {};
    if (filters?.periodId) {
      params.periodId = filters.periodId;
    } else if (filters?.month) {
      params.month = Number(filters.month);
      if (filters?.year) params.year = Number(filters.year);
    }
    if (filters?.clientCompanyId) {
      params.clientCompanyId = filters.clientCompanyId;
    }
    if (filters?.status) params.status = filters.status;
    return params;
  }, [filters]);

  useEffect(() => {
    fetchAttendancesTable(queryParams);
  }, [fetchAttendancesTable, queryParams]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) =>
        attendancesTable.some((row) => row.id === id)
      )
    );
  }, [attendancesTable]);

  if (tableLoading) return <p className="text-sm">Chargement...</p>;
  if (tableError) return <p className="text-red-500">{tableError}</p>;

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const toInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1
    )}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const getInitials = (name) => {
    if (!name) return "IMG";
    const parts = name.trim().split(/\s+/);
    const letters = parts.slice(0, 2).map((part) => part[0]);
    return letters.join("").toUpperCase();
  };

  const getDisplayStatus = (row) => {
    if (row.attendanceStatus === "ABSENT") return "ABSENT";
    if (row.lateStatus === "LATE") return "LATE";
    return "PRESENT";
  };

  const sortedRows = [...attendancesTable].sort((a, b) => {
    if (sortBy === "status") {
      const left = getDisplayStatus(a);
      const right = getDisplayStatus(b);
      const comparison = left.localeCompare(right);
      return sortDir === "asc" ? comparison : -comparison;
    }

    const leftDate = new Date(a.checkIn || a.date || 0).getTime();
    const rightDate = new Date(b.checkIn || b.date || 0).getTime();
    return sortDir === "asc" ? leftDate - rightDate : rightDate - leftDate;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedRows.map((row) => row.id));
    }
  };

  const handleOpenEdit = (row) => {
    setEditForm({
      id: row.id,
      employeeName: row.employee?.name || "Employe",
      checkIn: toInputValue(row.checkIn),
      checkOut: toInputValue(row.checkOut),
      attendanceStatus: row.attendanceStatus || "PRESENT",
      lateStatus: row.lateStatus || "ON_TIME",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm?.checkIn) {
      addToast({
        type: "error",
        message: "Entree requise",
      });
      return;
    }

    try {
      setEditLoading(true);
      await updateAttendance(editForm.id, {
        startTime: editForm.checkIn || null,
        endTime: editForm.checkOut || null,
        attendanceStatus: editForm.attendanceStatus,
        lateStatus: editForm.lateStatus,
      });
      addToast({
        type: "success",
        message: "Pointage mis a jour",
      });
      setEditOpen(false);
      setEditForm(null);
      fetchAttendancesTable(queryParams);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de modifier le pointage",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    try {
      await deleteAttendance(row.id);
      addToast({
        type: "success",
        message: "Pointage supprime",
      });
      fetchAttendancesTable(queryParams);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de supprimer le pointage",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkLoading(true);
      const results = await Promise.allSettled(
        selectedIds.map((id) => deleteAttendance(id))
      );
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failed > 0) {
        addToast({
          type: "error",
          message: "Certaines suppressions ont echoue",
        });
      } else {
        addToast({
          type: "success",
          message: "Pointages supprimes",
        });
      }

      setSelectedIds([]);
      fetchAttendancesTable(queryParams);
    } catch (error) {
      addToast({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Impossible de supprimer les pointages",
      });
    } finally {
      setBulkLoading(false);
      setBulkConfirmOpen(false);
    }
  };

  const containerClassName = embedded
    ? "h-full overflow-auto"
    : "bg-white border rounded-2xl overflow-auto";

  return (
    <div className={containerClassName}>
      <ConfirmModal
        open={bulkConfirmOpen}
        title="Supprimer des pointages"
        description="Voulez-vous vraiment supprimer les pointages selectionnes ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleBulkDelete}
        onClose={() => setBulkConfirmOpen(false)}
      />

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 bg-indigo-50 text-sm">
          <p className="font-medium">
            {selectedIds.length} selectionne(s)
          </p>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border text-xs text-neutral-700 hover:bg-neutral-50"
            onClick={() => setBulkConfirmOpen(true)}
            disabled={bulkLoading}
          >
            Supprimer
          </button>
        </div>
      )}

      {editOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg animate-scale-in space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Modifier le pointage
                </h2>
                <p className="text-xs text-neutral-500">
                  {editForm.employeeName}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-neutral-500 hover:text-neutral-700"
                onClick={() => {
                  setEditOpen(false);
                  setEditForm(null);
                }}
              >
                Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Entree"
                type="datetime-local"
                value={editForm.checkIn}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    checkIn: event.target.value,
                  }))
                }
              />

              <Input
                label="Sortie"
                type="datetime-local"
                value={editForm.checkOut}
                onChange={(event) =>
                  setEditForm((prev) => ({
                    ...prev,
                    checkOut: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="w-full flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Statut
                </label>
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={editForm.attendanceStatus}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      attendanceStatus: event.target.value,
                    }))
                  }
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Retard
                </label>
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={editForm.lateStatus}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      lateStatus: event.target.value,
                    }))
                  }
                >
                  <option value="ON_TIME">A l'heure</option>
                  <option value="LATE">En retard</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg border text-neutral-700"
                onClick={() => {
                  setEditOpen(false);
                  setEditForm(null);
                }}
                disabled={editLoading}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white"
                onClick={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? "Chargement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-[12px]">
        <thead className="bg-neutral-50 text-neutral-500 border-b">
          <tr>
            <th className="px-4 py-2 text-left">
              <input
                type="checkbox"
                checked={
                  selectedIds.length === sortedRows.length &&
                  sortedRows.length > 0
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-3 py-3 text-left">Avatar</th>
            <th className="px-3 py-3 text-left">Date</th>
            <th className="px-3 py-3 text-left">Agent</th>
            <th className="px-3 py-3 text-left">Entreprise</th>
            <th className="px-3 py-3 text-left">Entree</th>
            <th className="px-3 py-3 text-left">Sortie</th>
            <th className="px-3 py-3 text-left">Statut</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={row.id}
              className="border-t hover:bg-neutral-50"
            >
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.id)}
                  onChange={() => toggleSelect(row.id)}
                />
              </td>
              <td className="px-3 py-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-500">
                  {row.employee?.avatar ? (
                    <img
                      src={row.employee.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(row.employee?.name)
                  )}
                </div>
              </td>
              <td className="px-3 py-3 text-neutral-600">
                {formatDate(row.date || row.checkIn)}
              </td>
              <td className="px-3 py-3">
                <p className="text-sm font-medium text-neutral-700">
                  {row.employee?.name || "-"}
                </p>
              </td>
              <td className="px-3 py-3 text-neutral-600">
                {row.clientCompany?.companyName || "-"}
              </td>
              <td className="px-3 py-3 text-neutral-600">
                {formatTime(row.checkIn)}
              </td>
              <td className="px-3 py-3 text-neutral-600">
                {formatTime(row.checkOut)}
              </td>
              <td className="px-3 py-3">
                <Badge status={getDisplayStatus(row)} />
              </td>
              <td className="px-3 py-3 text-right">
                <AttendanceActions
                  attendance={row}
                  onView={() => navigate(`/attendance/${row.id}`)}
                  onEdit={() => handleOpenEdit(row)}
                  onDelete={() => handleDelete(row)}
                />
              </td>
            </tr>
          ))}

          {sortedRows.length === 0 && (
            <tr>
              <td
                colSpan="9"
                className="px-3 py-6 text-center text-neutral-400"
              >
                Aucun pointage
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
