import AttendanceForm from "./AttendanceForm";
import AttendanceTable from "./AttendanceTable";
import ImportAttendanceForm from "./ImportAttendanceForm";

const AttendancePage = () => {
  return (
    <section className="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* GAUCHE */}
      <div className="space-y-4">
        <AttendanceForm />
        <ImportAttendanceForm />
      </div>

      {/* DROITE */}
      <div className="xl:col-span-2">
        <AttendanceTable />
      </div>
    </section>
  );
};

export default AttendancePage;
