import React from "react"
import Button from "../ui/button"
import SearchForm from "../ui/search-form"
import { Bell, CalendarDays, Plus } from "lucide-react"


const Navbar = () => {
  
  return (
    <header className="sticky top-0 bg-white z-10 w-full flex items-center justify-between gap-4 py-3.5 px-4 border-b">
    <div className="flex flex-col items-start gap-0.5">
        <p className="flex items-center justify-start gap-1 text-xl font-semibold">
            <span>{"Bienvenue,"}</span> 
            <span className="text-[#6366F1]"> 
            {" Benjamin !"}
            </span>
        </p>
        <p className="text-[13px] font-medium">Accueil</p>
    </div>
    <div className="flex items-center gap-4">
        <SearchForm/>
        <div className="flex items-center justify-between gap-4 border-l px-4 text-neutral-500">
            <Bell/>
            <Button className={'flex items-center justify-between gap-2 px-6 py-3 rounded-lg text-neutral-500'} buttonStyle={false}>
                <CalendarDays size={16}/>
                <span className="text-neutral-600 text-normal">Attendance</span>
            </Button>
            <Button className={'flex items-center justify-between gap-2 px-6 py-3 rounded-lg text-neutral-500'} buttonStyle={true}>
                <Plus size={16}/>
                <span className="text-normal">Employé(e)</span>
            </Button>
        </div>
    </div>
    </header>
  )
}

export default Navbar
