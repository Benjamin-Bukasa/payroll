import React from 'react'
import AttendanceForm from '../../components/blocs/Attendances/AttendanceForm'
import AttendanceTable from '../../components/blocs/Attendances/AttendanceTable'
import ScrollArea from './../../components/ui/scroll-area';
import ImportAttendanceForm from '../../components/blocs/Attendances/ImportAttendanceForm';

function CreateAttendance() {
  return (
    <>
    <div className="w-full h-full  flex items-start justify-between gap-4 p-2">
        <div className="h-full w-2/3 rounded-lg p-2 flex flex-col gap-4">
        <AttendanceForm/>
        <ScrollArea className={"h-full"}>
            <AttendanceTable/>
        </ScrollArea>
        </div>
        <div className="w-1/3 h-full border p-2">
            <ImportAttendanceForm/>
        {/* Reserved for future use */}
        </div>
    </div>
    </>
  )
}

export default CreateAttendance