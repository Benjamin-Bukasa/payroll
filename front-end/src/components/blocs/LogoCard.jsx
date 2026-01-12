import React from 'react';
import Logo from "../ui/logo";
import Button from "../ui/button"

import { HandCoins,ChevronLeft } from 'lucide-react';


const LogoCard = () => {
  return (
    <div className='xl:w-[90%] xl:flex xl:item-center xl:justify-between xl:gap-2 xl:py-6 border-b'>
      <div className="xl:flex xl:item-center xl:justify-start xl:gap-2 text-indigo-500">
        <HandCoins size={30}/>
        <span className='xl:text-xl font-semibold text-neutral-900'>Neopayroll</span>
      </div>
      <Button className={'w-6 h-6 flex items-center justify-center rounded-full text-center'}>
        <ChevronLeft size={16}/>
      </Button>
    </div>
  );
}

export default LogoCard;
