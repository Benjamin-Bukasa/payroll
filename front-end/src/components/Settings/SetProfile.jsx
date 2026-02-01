import React from 'react';
// import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';


const SetProfile = () => {

     const user = useAuthStore((s) => s.user);
      const checkingAuth = useAuthStore((s) => s.checkingAuth);
    
      if (checkingAuth || !user) return null;

  return (
     <>
          <div className='flex flex-col flex-1 h-full'>
               <p className="">
                    {user.firstname}
               </p>
               <p className="">
                    {user.email}
               </p>
               <p className="">
                    <img src={user.email} alt=""  />
               </p>
               <p className="">{user.role}</p>
          </div>

     </>
  );
}

export default SetProfile;
