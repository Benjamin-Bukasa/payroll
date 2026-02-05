import React from "react";
import { useNavigate } from "react-router-dom";


import EmployeeTable from "../../components/blocs/employees/EmployeeTable";
import HomeSummary from "../../components/blocs/Home/HomeSummary";
import EmployeesChart from "../../components/blocs/Home/EmployeesChart";
import MostAbsentEmployeeCard from "../../components/blocs/employees/MostAbsentEmployeeCard";
import TopClientCompanyCard from "../../components/blocs/Companies/TopClientCompanyCard";
import LeastClientCompanyCard from "../../components/blocs/Companies/LeastClientCompanyCard";
import MostAbsentCompanyCard from "../../components/blocs/Companies/MostAbsentCompanyCard";
import ClientCompanyDonutChart from "../../components/blocs/Companies/ClientCompanyDonutChart";
import Button from "../../components/ui/button";
import { Plus, PlusIcon } from "lucide-react";
import ScrollArea from './../../components/ui/scroll-area';

function Home() {

  const navigate = useNavigate();
  const handleClick = ()=>{
    navigate('/createEmployee')
  }

  return (
    <section className="h-full flex items-start justify-between gap-4 p-2">
      <div className="h-full flex flex-1 flex-col gap-2">
        <div className="w-full flex flex-col md:flex-row gap-4">
          <HomeSummary />
          <EmployeesChart />
        </div>
        <div className={"flex flex-col items-start h-full border rounded-lg"}>
          <div className="sticky top-0 w-full flex items-center justify-between bg-white px-2 py-3">
            <h4 className="text-indigo-500 text-lg font-medium">Liste des employée</h4>
            <Button buttonStyle={true} className={"flex items-center justify-start px-4 py-2 rounded-lg"} onclick={handleClick}>
              <PlusIcon size={14}/>
              <span>Nouveau</span>
            </Button>
          </div>
          <ScrollArea className={"w-full h-[500px] flex flex-col overflow-hidden border-none"}>
            <EmployeeTable/>
          </ScrollArea>
        </div>
      </div>

      {/* ===== DROITE ===== */}
      <aside className="w-full h-full border xl:w-1/3 flex flex-col gap-4">
        
        <div className="rounded-lg border p-3 flex flex-col gap-3">
          <h3 className="text-md font-semibold pb-2 border-b">
            Effectifs employés
          </h3>
          <TopClientCompanyCard />
          <LeastClientCompanyCard />
          <MostAbsentCompanyCard />
        </div>
          <ClientCompanyDonutChart/>
      </aside>
    </section>
  );
}

export default Home;
