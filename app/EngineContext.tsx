// Initialize the engine and util imports in the SharedResourcesProvider component:
// Note: must import Uitls as a module instead of a component for engine to work (or else you will get 'self' is undefined wasm errors)
'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
type Utils = typeof import('./Utils')
type Engine = typeof import('@ezkljs/engine/web/ezkl')

interface SharedResources {
  engine: Engine
  utils: Utils
}

const SharedResourcesContext = createContext<SharedResources | null>(null)
export const useSharedResources = (): SharedResources => {
  const context = useContext(SharedResourcesContext)
  if (!context) {
    throw new Error(
      'useSharedResources must be used within a SharedResourcesProvider',
    )
  }
  return context
}

interface SharedResourcesProviderProps {
  children: React.ReactNode
}

export const SharedResourcesProvider: React.FC<
  SharedResourcesProviderProps
> = ({ children }) => {
  const [engine, setEngine] = useState<any>(null) // Replace 'any' with the actual type of 'engine'
  const [utils, setUtils] = useState<any>(null) // Replace 'any' with the actual type of 'utils'

  useEffect(() => {
    async function initializeResources() {
      // Initialize the WASM module
      const engine = await import('@ezkljs/engine/web/ezkl.js')
      setEngine(engine)
      await (engine as any).default()
      // For human readable wasm debug errors call this function
      engine.init_panic_hook()
      // Initialize the utils module
      const utils = await import('./Utils')
      setUtils(utils)
    }
    initializeResources()
  }, [])

  return (
    <SharedResourcesContext.Provider value={{ engine, utils }}>
      {children}
    </SharedResourcesContext.Provider>
  )
}
