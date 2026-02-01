import React from 'react';

const AttendancesSummaryCard = ({children, className}) => {
  return (
    <div className={`${className} w-full md:w-/2 border rounded-lg p-4 flex flex-col gap-10`}>
      {children}
    </div>
  );
}

export default AttendancesSummaryCard;
