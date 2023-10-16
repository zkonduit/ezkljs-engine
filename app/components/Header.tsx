'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image';


import TopNav from './TopNav'

import { useAPINavColumnStore } from './APINavColumn'
import Link from 'next/link'

// const { open, setOpen } = useAPINavColumnStore.getState()

export default function Header() {
  // const { open, setOpen } = useAPINavColumnStore()
  const { open, setOpen } = useAPINavColumnStore()
  return (
    <div className='bg-black fixed w-full top-0 left-0 z-50 h-16  border-b-2 border-slate-300  lg:px-10 md:px-6 sm:px-4 px-2  flex items-center justify-between'>
      {/* left */}
      <div className='w-full md:w-2/12 flex items-center ml-2'>
        {!open && (
          <>
            <FontAwesomeIcon
              icon={faBars}
              onClick={() => {
                setOpen(true)
              }}
              className='w-4 mr-2 md:hidden'
            />
            <Link href='/'>
              <h1>EZKL Engine</h1>
            </Link>
          </>
        )}
    <Image 
          src='/EZKL_LOGO.jpeg' 
          alt='EZKL Logo' 
          width={50}  // Adjust width as needed
          height={50}  // Adjust height as needed
        />
      </div>
      {/* right */}

      <TopNav />
    </div>
  )
}
