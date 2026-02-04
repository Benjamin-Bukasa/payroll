import React from "react";
import { useNavigate } from "react-router-dom";

import ScrollArea from "../../components/ui/scroll-area";
import EmployeeTable from "../../components/blocs/employees/EmployeeTable";
import HomeSummary from "../../components/blocs/Home/HomeSummary";
import EmployeesChart from "../../components/blocs/Home/EmployeesChart";
import MostAbsentEmployeeCard from "../../components/blocs/employees/MostAbsentEmployeeCard";
import TopClientCompanyCard from "../../components/blocs/Companies/TopClientCompanyCard";
import LeastClientCompanyCard from "../../components/blocs/Companies/LeastClientCompanyCard";
import MostAbsentCompanyCard from "../../components/blocs/Companies/MostAbsentCompanyCard";
import ClientCompanyDonutChart from "../../components/blocs/Companies/ClientCompanyDonutChart";
import Button from "../../components/ui/button";
import { Plus } from "lucide-react";

function Home() {

  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col xl:flex-row gap-4 p-4">
      
      {/* ===== GAUCHE ===== */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        
        {/* SUMMARY + CHART */}
        <div className="w-full flex flex-col md:flex-row gap-4">
          <HomeSummary />
          <EmployeesChart />
        </div>

        {/* TABLE */}
        <ScrollArea className="xl:h-[520px]">
          <div className="sticky top-0 z-10 bg-white border-b py-3 px-4">
            <div className="flex items-center justify-between py-2">
              <h3 className="text-lg font-semibold">Tous les employés</h3>
              <Button 
                buttonStyle={true}
                className={`px-2 py-1 flex items-center justify-start rounded-lg `}
                onClick={()=>navigate(`/createEmployee`)}>
                  <Plus size={14}/>
                  <span className="text-[12px]">Nouveau</span>
              </Button>
            </div>
          </div>
          <EmployeeTable />
        </ScrollArea>
      </div>

      {/* ===== DROITE ===== */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        
        <div className="rounded-lg border p-3">
          <MostAbsentEmployeeCard />
        </div>

        <div className="rounded-lg border p-3 flex flex-col gap-3">
          <h3 className="text-md font-semibold pb-2 border-b">
            Effectifs employés
          </h3>
          <TopClientCompanyCard />
          <LeastClientCompanyCard />
          <MostAbsentCompanyCard />
        </div>
          <ClientCompanyDonutChart/>
      </div>
    </div>
  );
}

export default Home;
