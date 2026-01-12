import React from 'react'

import ScrollArea from '../../components/ui/scroll-area'
import SearchForm from '../../components/ui/search-form'


import { useEmployeeStore } from './../../store/employeeStore';
import EmployeeTable from '../../components/blocs/employees/EmployeeTable';





function Home() {

  const employees = useEmployeeStore((s) => s.employees);
  console.log(employees);
  

  return (
    <>
    <div className="flex items-start justify-between gap-8 px-4 py-8">
        {/* bloc de gauche  */}
        <div className="w-2/3 h-full flex flex-col overflow-y-auto custom-scroll">
          <div className="h-1/3 flex items-center">
            Summary and Chart
          </div>
          <ScrollArea className="h-2/3">
            <div className='w-full sticky top-0  z-10 bg-white border-b py-3 px-4 flex items-center 
                  justify-between'>
                  <h3 className="text-lg font-semibold">Tous les employés</h3>
                  <SearchForm/>
            </div>
            <EmployeeTable />
          </ScrollArea>
        </div>
        {/* Bloc de droite */}
        <div className="flex flex-col w-1/3 h-full">
        </div>
    </div>
    </>
  )
}

export default Home