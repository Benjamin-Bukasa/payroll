import React from 'react'
import AttendancesSummary from './../../components/blocs/Attendances/AttendancesSummary';
import ScrollArea from '../../components/ui/scroll-area';
import EmployeeTable from '../../components/blocs/employees/EmployeeTable';
import AttendancesMonthlyCompiled from '../../components/blocs/Attendances/AttendancesMonthlyCompiled';
import AttendancesEmployeesOnLeave from '../../components/blocs/Attendances/AttendancesEmployeesOnLeave';

function Attendance() {
  return (
    <section className='h-full flex items-start justify-start gap-4 p-2'>
      <div className="flex flex-1 flex-col gap-2">
        <AttendancesSummary/>
        <ScrollArea className={"h-[670px]"}>
          <h3 className="p-4 font-semibold text-lg">Liste de pointages</h3>
          <EmployeeTable/>
        </ScrollArea>
      </div>
      <aside className="w-1/3 h-full p-1 flex flex-col items-start justify-start gap-2 rounded-lg">
        <AttendancesMonthlyCompiled/>
        <AttendancesEmployeesOnLeave/>
      </aside>
    </section>
  )
}

export default Attendance