import Badge from "../../ui/badge";

const AttendanceTable = ({ attendances = [] }) => {
  return (
    <div className="bg-white  rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Entrée</th>
            <th className="px-4 py-2 text-left">Sortie</th>
            <th className="px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>

        <tbody>
          {attendances.map((a, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-2">{a.date}</td>
              <td className="px-4 py-2">{a.checkIn}</td>
              <td className="px-4 py-2">{a.checkOut}</td>
              <td className="px-4 py-2">
                <Badge status={a.status} />
              </td>
            </tr>
          ))}

          {attendances.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-400">
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
