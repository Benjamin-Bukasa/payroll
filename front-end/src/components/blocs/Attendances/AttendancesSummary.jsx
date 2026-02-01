import React from 'react';
import AttendancesSummaryCard from './AttendancesSummaryCard';
import { ArrowBigUpIcon, Dot, MoreVertical } from 'lucide-react';
import Button from '../../ui/button';

const AttendancesSummary = () => {
  return (
    <div className='w-full py-1.5 flex gap-4'>
        <AttendancesSummaryCard>
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Total de présences aujourd'hui</h4>
                <MoreVertical size={16}/>
            </div>
            <div className="">
                <p className='text-3xl font-semibold text-neutral-800'>35</p>
                <p className='font-medium text-neutral-500'>Agents présents au bureau</p>
            </div>
        </AttendancesSummaryCard>
        <AttendancesSummaryCard>
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Total d'absence ce mois</h4>
                    <MoreVertical size={16}/>
            </div>
            <div className='text-lg font-semibold text-neutral-800 flex flex-col items-start justify-start gap-2'>
                <div className="flex items-end gap-2">
                    <p className='text-3xl leading-none'>35</p>
                    <p className='text-[12px] text-green-500 font-semibold flex items-center py-0.5s px-1 gap-1 bg-green-100 rounded-lg'>
                        <ArrowBigUpIcon size={10}/>
                        <span className='leading-none'>30%</span>
                    </p>
                </div>
                <p className='font-medium text-neutral-500 text-sm'>Agents présents au bureau</p>
            </div>
        </AttendancesSummaryCard>
    </div>
  );
}

export default AttendancesSummary;
