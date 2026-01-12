import React from 'react';
import { Dot } from 'lucide-react';

const Badge = ({status, className}) => {

let value = status.charAt(0).toUpperCase()+status.slice(1).toLowerCase()

  return (
    <>
      <span className={`w-24 px-2 rounded-full flex items-center justify-start gap-1 h-6 text-[14px] text-center
        ${status=="ACTIF"? "bg-green-100 text-green-500": status=="INACTIF"?"bg-red-100 text-red-500":"bg-gray-100 text-gray-500"}
        font-semibold ${className} `}>
        <Dot size={20}/>
        {value}
      </span>
    </>
  );
}

export default Badge;
