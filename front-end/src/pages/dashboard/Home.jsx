import React from "react";
import ScrollArea from "../../components/ui/scroll-area";
import EmployeeTable from "../../components/blocs/employees/EmployeeTable";
import HomeSummary from "../../components/blocs/Home/HomeSummary";
import EmployeesChart from "../../components/blocs/Home/EmployeesChart";
import MostAbsentEmployeeCard from "../../components/blocs/employees/MostAbsentEmployeeCard";
import TopClientCompanyCard from "../../components/blocs/Companies/TopClientCompanyCard";
import LeastClientCompanyCard from "../../components/blocs/Companies/LeastClientCompanyCard";
import MostAbsentCompanyCard from "../../components/blocs/Companies/MostAbsentCompanyCard";
import ClientCompanyDonutChart from "../../components/blocs/Companies/ClientCompanyDonutChart";

function Home() {
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
        <ScrollArea className="xl:h-[540px]">
          <div className="sticky top-0 z-10 bg-white border-b py-3 px-4">
            <h3 className="text-lg font-semibold">
              Tous les employés
            </h3>
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
