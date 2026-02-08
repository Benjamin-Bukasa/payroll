import React from "react";


import EmployeeTable from "../../components/blocs/employees/EmployeeTable";
import HomeSummary from "../../components/blocs/Home/HomeSummary";
import EmployeesChart from "../../components/blocs/Home/EmployeesChart";
import TopClientCompanyCard from "../../components/blocs/Companies/TopClientCompanyCard";
import LeastClientCompanyCard from "../../components/blocs/Companies/LeastClientCompanyCard";
import MostAbsentCompanyCard from "../../components/blocs/Companies/MostAbsentCompanyCard";
import ClientCompanyDonutChart from "../../components/blocs/Companies/ClientCompanyDonutChart";
import Button from "../../components/ui/button";
import { PlusIcon } from "lucide-react";
import ScrollArea from "../../components/ui/scroll-area";

function Home() {


  return (
    <section className="h-full flex flex-col p-4 overflow-auto xl:overflow-hidden box-border">
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-[2] min-h-0">
          <div className="xl:col-span-2 flex flex-col lg:flex-row gap-2 min-h-0 items-stretch">
            <div className="flex-1 min-h-0 h-full">
              <HomeSummary />
            </div>
            <div className="flex-1 min-h-0 h-full">
              <EmployeesChart />
            </div>
          </div>

          <div className="flex flex-col gap-4 min-h-0">
            <TopClientCompanyCard />
            <LeastClientCompanyCard />
            <MostAbsentCompanyCard />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-[3] min-h-0">
          <div className="xl:col-span-2 flex flex-col min-h-0">
            <div className="bg-white border rounded-2xl p-5 flex flex-col gap-4 flex-1 min-h-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800">
                    Liste des employés
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Vue rapide des équipes
                  </p>
                </div>

              </div>

              <div className="border rounded-xl overflow-hidden flex-1 min-h-0">
                <ScrollArea className="w-full h-full flex flex-col overflow-hidden border-none">
                  <EmployeeTable />
                </ScrollArea>
              </div>
            </div>
          </div>

          <div className="min-h-0 mt-32">
            <ClientCompanyDonutChart />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
