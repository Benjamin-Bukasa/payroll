import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Button from '../ui/button';

const PayrollSettings = () => {
  return (
    <section className='w-full h-full p-2 flex flex-col justify-start items-start gap-4'>
        <div className="w-full flex items-center justify-between">
            <ul className="p-2 flex items-center justify-between gap-4 bg-neutral-100 text-neutral-700 rounded-lg">
                <Link to={`variables`} className='rounded-lg bg-white px-4 py-2'><li className="">Variables de paie</li></Link>
                <Link to={`currency`} className='rounded-lg bg-white px-4 py-2'><li className="">Devise</li></Link>
                <Link to={`schedule`} className='rounded-lg bg-white px-4 py-2'><li className="">Periode de paie</li></Link>
                <Link to={`taxes`} className='rounded-lg bg-white px-4 py-2'><li className="">Taxes et impôt</li></Link>
                <Link to={`smig`} className='rounded-lg bg-white px-4 py-2'><li className="">Smig</li></Link>
                <Link to={`paybilling`} className='rounded-lg bg-white px-4 py-2'><li className="">Bulletin de paie</li></Link>
            </ul>

        </div>
      <Outlet/>
    </section>
  );
}

export default PayrollSettings;
