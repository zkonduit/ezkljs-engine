import React from 'react'
export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex w-full fixed z-[100] md:w-auto justify-center md:block md:ml-64 p-4 min-h-screen lg:pl-40 md:pl-20 sm:pl-10 overflow-auto'>
      {children}
    </div>
  )
}
