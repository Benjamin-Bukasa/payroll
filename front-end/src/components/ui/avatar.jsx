import React from 'react';

const Avatar = ({avatarImg, className}) => {
  return (
    <div className={`rounded-full ${avatarImg?"":"bg-indigo-100 text-indigo-500 flex items-center justify-center font-semibold"} ${className}`}>
      {avatarImg?<img src={avatarImg} className='w-1/2'/>:"BK"}
    </div>
  );
}

export default Avatar;
