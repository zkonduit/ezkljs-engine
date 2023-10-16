import React from 'react';
export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex w-full  md:w-auto justify-center md:block md:ml-64 p-4 h-[calc(100%-4rem)] lg:pl-40 md:pl-20 sm:pl-10'>
      {children}
    </div>
  )
}
