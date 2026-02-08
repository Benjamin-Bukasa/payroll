import Badge from "../../ui/badge";

const AttendanceOvertimeTable = ({ rows, loading, error }) => {
  if (loading) {
    return <p className="text-sm text-neutral-500">Chargement...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

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

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "-";
    return Number(value).toFixed(2);
  };

  const formatRate = (value) => {
    if (value === null || value === undefined) return "-";
    return `x${Number(value).toFixed(2)}`;
  };

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-[10px]">
        <thead className="bg-neutral-50 text-neutral-500 border-b">
          <tr>
            <th className="px-3 py-3 text-left">Date</th>
            <th className="px-3 py-3 text-left">Agent</th>
            <th className="px-3 py-3 text-left">Entreprise</th>
            <th className="px-3 py-3 text-left">Entree</th>
            <th className="px-3 py-3 text-left">Sortie</th>
            <th className="px-3 py-3 text-left">Statut</th>
            <th className="px-3 py-3 text-left">Heures</th>
            <th className="px-3 py-3 text-left">Normales</th>
            <th className="px-3 py-3 text-left">Sup</th>
            <th className="px-3 py-3 text-left">Taux</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-t hover:bg-neutral-50"
            >
              <td className="px-3 py-3 text-neutral-600">
                {formatDate(row.date || row.checkIn)}
              </td>
              <td className="px-3 py-3">
                <p className="text-[10px] font-medium text-neutral-700">
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
                <Badge
                  status={
                    row.attendanceStatus === "ABSENT"
                      ? "ABSENT"
                      : row.lateStatus === "LATE"
                      ? "LATE"
                      : "PRESENT"
                  }
                />
              </td>
              <td className="px-3 py-3 text-neutral-700 font-medium">
                {formatNumber(row.workedHours)}
              </td>
              <td className="px-3 py-3 text-neutral-700">
                {formatNumber(row.normalHours)}
              </td>
              <td className="px-3 py-3 text-neutral-700">
                {formatNumber(row.overtimeHours)}
              </td>
              <td className="px-3 py-3 text-neutral-700">
                {formatRate(row.overtimeRate)}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan="10"
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

export default AttendanceOvertimeTable;
