import { Home,Building2,SquareCheck,User,LogOut,Database,FileText,Bell,Settings,FolderOpen } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItems = () => {
  return (
    <>
    <div className="xl:w-full xl:h-full xl:flex xl:flex-col xl:justify-between px-4">
      <div className="w-full xl:flex xl:flex-col xl:justify-between xl:items-start xl:gap-4">
        <h3 className="w-full text-neutral-500 font-medium text-[13px]">MENU</h3>
        <ul className="w-full xl:flex xl:flex-col gap-3 text-neutral-500 font-medium">
            <Link to="/dashboard" className='w-full flex items-center justify-content gap-4 py-1'>
                <Home size={20}/>
                <li>Accueil</li>
            </Link>
            <Link to="/client-companies" className='w-full flex items-center justify-content gap-4 py-1'>
                <Building2 size={20}/>
                <li>Entreprises</li>
            </Link>
            <Link to="/employees" className='w-full flex items-center justify-content gap-4 py-1'>
                <User size={20}/>
                <li>Employés</li>
            </Link>
            <Link to="/attendance" className='w-full flex items-center justify-content gap-4 py-1'>
                <SquareCheck size={20}/>
                <li>Pointages</li>
            </Link>
            <Link to="/leaves" className='w-full flex items-center justify-content gap-4 py-1'>
                <LogOut size={20}/>
                <li>Congé</li>
            </Link>
            <Link to="/payroll" className='w-full flex items-center justify-content gap-4 py-1'>
                <Database size={20}/>
                <li>Paie</li>
            </Link>
            <Link to="/report" className='w-full flex items-center justify-content gap-4 py-1'>
                <FileText size={20}/>
                <li>Rapport</li>
            </Link>
        </ul>
      </div>
      <div className="w-full xl:flex xl:flex-col xl:justify-between xl:items-start xl:gap-4">
        <h3 className="w-full text-neutral-500 font-medium text-[13px]">UTILISATEUR</h3>
        <ul className="w-full xl:flex xl:flex-col gap-3 text-neutral-500 font-medium">
            <Link to="/notifications" className='w-full flex items-center justify-start gap-4 py-1'>
                <Bell size={20}/>
                <li>Notifications</li>
            </Link>
            <Link to="/settings" className='w-full flex items-center justify-start gap-4 py-1'>
                <Settings/>
                <li>Paramètres</li>
            </Link>
            <Link to="/folders" className='w-full flex items-center justify-start gap-4 py-1'>
                <FolderOpen/>
                <li>Documents</li>
            </Link>
        </ul>
      </div>
    </div>
    </>
  );
}

export default SidebarItems;
