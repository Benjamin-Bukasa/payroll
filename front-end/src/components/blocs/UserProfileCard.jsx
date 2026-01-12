import React from 'react';
import Button from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import {ChevronRight} from "lucide-react"

const UserProfileCard = () => {

const navigate = useNavigate()

const handleNavigate = ()=>{
  navigate('/profile')
}

  return (
    <div className='xl:w-full xl:flex xl:items-center xl:justify-between xl:px-2 xl:py-6 border-t'>
        <div className="xl:w-2/3 xl:flex xl:items-center xl:justify-start xl:gap-2">
          <div className="bg-neutral-100 rounded-full xl:w-9 xl:h-9 cursor-pointer" onClick={handleNavigate}>
            <img src="" alt="" />
          </div>
          <div className="text-[12px]">
            <p className="font-medium text-neutral-900">Benjamin Kabeya</p>
            <p className="font-normal text-neutral-500">HRBP junior</p>
          </div>
        </div>
      <Button className={"w-6 h-6 flex items-center justify-center rounded-full text-center"} 
      onClick={handleNavigate}>
        <ChevronRight size={16}/>
      </Button>
    </div>
  );
}

export default UserProfileCard;
