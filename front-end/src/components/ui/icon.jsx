import React from 'react';
import {HandCoins} from "lucide-react"

const Icon = ({iconSize, className, onClick}) => {
  return (
    <span className={`w-10 h-10 flex items-center justify-center p-2 text-center rounded-xl ${className}`} onClick={onClick}>
      <HandCoins size={iconSize}/>
    </span>
  );
}

export default Icon;
