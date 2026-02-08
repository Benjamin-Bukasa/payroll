import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../../components/ui/badge";
import Button from "../../components/ui/button";
import { getAttendanceById } from "../../api/attendance";

const AttendanceDetail = () => {
  const { attendanceId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getAttendanceById(attendanceId);
        if (mounted) {
          setAttendance(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Impossible de charger le pointage"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (attendanceId) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [attendanceId]);

  const employeeName = useMemo(() => {
    if (!attendance?.employee) return "-";
    const first = attendance.employee.firstname || "";
    const last = attendance.employee.lastname || "";
    return `${first} ${last}`.trim() || "-";
  }, [attendance]);

  const getInitials = (name) => {
    if (!name || name === "-") return "IMG";
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

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

  if (loading) {
    return (
      <div className="p-4 text-sm text-neutral-500">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">{error}</div>
    );
  }

  if (!attendance) {
    return (
      <div className="p-4 text-sm text-neutral-500">
        Pointage introuvable
      </div>
    );
  }

  const isLate = attendance.lateStatus === "LATE";
  const statusMessage =
    attendance.attendanceStatus === "ABSENT"
      ? "Employe absent."
      : isLate
      ? "Employe present mais en retard."
      : "Employe present.";

  return (
    <div className="h-full p-4 space-y-4">
      <div className="text-sm text-neutral-500">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/attendance")}
        >
          Pointages
        </span>{" "}
        / <span className="text-neutral-800">Detail</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            Detail du pointage
          </h1>
          <p className="text-sm text-neutral-500">
            {employeeName}
          </p>
        </div>
        <Button
          buttonStyle={false}
          className="px-4 py-2 rounded-lg text-sm"
          onClick={() => navigate("/attendance")}
        >
          Retour
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-4">
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">
            Informations
          </h3>
          <Info
            label="Entreprise"
            value={attendance.clientCompany?.companyName}
          />
          <Info
            label="Date"
            value={formatDate(attendance.date || attendance.checkIn)}
          />
          <Info
            label="Entree"
            value={formatTime(attendance.checkIn)}
          />
          <Info
            label="Sortie"
            value={formatTime(attendance.checkOut)}
          />
          <Info
            label="Heures travaillees"
            value={
              attendance.workedHours !== null &&
              attendance.workedHours !== undefined
                ? `${attendance.workedHours} h`
                : "-"
            }
          />
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-800">
            Statut
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              status={attendance.attendanceStatus || "PRESENT"}
            />
            {isLate && <Badge status="LATE" />}
          </div>
          <p className="text-xs text-neutral-500">
            {statusMessage}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center text-sm text-neutral-500">
            {attendance.employee?.avatar ? (
              <img
                src={attendance.employee.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(employeeName)
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-neutral-900">
              {employeeName}
            </p>
            <p className="text-xs text-neutral-500">
              {attendance.employee?.position || "-"}
            </p>
            <p className="text-xs text-neutral-400">
              {attendance.clientCompany?.companyName || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-neutral-400">{label}</p>
    <p className="text-sm font-medium text-neutral-800">
      {value || "-"}
    </p>
  </div>
);

export default AttendanceDetail;
