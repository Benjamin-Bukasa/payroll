import { HandCoins } from 'lucide-react';
import React from 'react';

const Logo = ({className,children,iconSize}) => {
  return (
    <div className={` ${className}`}>
        <HandCoins size={iconSize}/>
        {children}
    </div>
  );
}

export default Logo;
