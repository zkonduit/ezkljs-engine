'use client'
import Nav from './components/Nav'
import dynamic from 'next/dynamic'
import React from 'react'

const App = dynamic(() => import('./App'), { ssr: false })

function Home() {
  return (
    <React.Fragment>
      {/* <Nav /> */}
      <App />
    </React.Fragment>
  );
}

export default Home
