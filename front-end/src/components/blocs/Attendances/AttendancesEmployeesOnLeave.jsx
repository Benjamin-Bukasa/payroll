import React from 'react';
import Button from '../../ui/button';

const AttendancesEmployeesOnLeave = () => {
  return (
    <>
        <div className={"w-full h-1/2 flex flex-col items-start justify-start gap-2 border rounded-lg p-2"}>
        <div className="w-full flex items-center justify-between px-2 py-4 border-b">
            <h3 className="text-lg font-semibold text-indigo-600">Employés en congé</h3>
            <Button className={`px-4 py-1 rounded-lg`}>
                Voir plus
            </Button>
        </div>
        <div className="w-full flex-1 flex items-center justify-center">
            Afficher ici la liste des employé en congé
        </div>
      </div>
    </>
  );
}

export default AttendancesEmployeesOnLeave;
