import React from 'react'
import { Outlet } from 'react-router-dom'
import SettingsSideBar from '../../components/blocs/SettingsSideBar';

function Settings() {
  return (
    <>
    <div className="w-full h-full flex justify-start items-start">

      <SettingsSideBar />
      <div className="h-full flex flex-1 border-l">
        <Outlet />
        
      </div>
    </div>
    </>
  )
}

export default Settings