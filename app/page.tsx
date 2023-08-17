'use client'
import dynamic from 'next/dynamic'
import React from 'react'

const App = dynamic(() => import('./App'), { ssr: false })

function Home() {
  const isTest = process.env.NEXT_PUBLIC_REACT_APP_ENTRY_POINT === 'test'

  return <React.Fragment> <App /></React.Fragment>
}

export default Home
