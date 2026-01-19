import React from 'react'
import ScrollArea from '../../components/ui/scroll-area'
// import SearchForm from '../../components/ui/search-form'
// import { useEmployeeStore } from './../../store/employeeStore';
import EmployeeTable from '../../components/blocs/employees/EmployeeTable';
import HomeSummary from '../../components/blocs/Home/HomeSummary';
import EmployeesChart from '../../components/blocs/Home/EmployeesChart';
import MostAbsentEmployeeCard from '../../components/blocs/employees/MostAbsentEmployeeCard';
import TopClientCompanyCard from '../../components/blocs/Companies/TopClientCompanyCard';
import LeastClientCompanyCard from '../../components/blocs/Companies/LeastClientCompanyCard';




function Home() {

  // const employees = useEmployeeStore((s) => s.employees);
  // console.log(employees);
  
  return (
    <>
    <div className="h-full flex items-start justify-between gap-2 p-4">
        {/* bloc de gauche  */}
        <div className="w-2/3 h-full flex flex-col gap-3 overflow-y-auto custom-scroll">
          <div className=" flex items-center justify-between gap-4">
            <HomeSummary/>
            <EmployeesChart/>
          </div>
          <ScrollArea className="h-[550px] pb-2">
            <div className='w-full sticky top-0  z-10 bg-white border-b py-3 px-4 flex items-center 
                  justify-between'>
                  <h3 className="text-lg font-semibold">Tous les employés</h3>
                  {/* <SearchForm/> */}
            </div>
            <EmployeeTable />
          </ScrollArea>
        </div>
        {/* Bloc de droite */}
        <div className="w-1/3 h-full p-1 flex flex-col gap-2">
          <div className="w-full h-1/2 rounded-lg border p-2 overflow-y-auto custom-scroll">
            <MostAbsentEmployeeCard/>
          </div>
          <div className="w-full h-1/2 flex flex-col justify-between rounded-lg border p-2 overflow-y-auto custom-scroll">
          <h3 className="text-md font-semibold pb-2 border-b">Effectifs Employés</h3>
            <TopClientCompanyCard/>
            <LeastClientCompanyCard/>
            <LeastClientCompanyCard/>
          </div>
        </div>
    </div>
    </>
  )
}

export default Home