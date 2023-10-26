// Example for pages/Page1.js
'use client'
import {
  FileInput,
  Label,
  Button,
  Alert,
  Spinner as _Spinner,
} from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { formDataSchema } from './parsers'
import { parse, stringify } from "json-bigint";
import { number } from 'zod';

type Utils = typeof import("../Utils")
type Engine = typeof import("@ezkljs/engine/web/ezkl")

type Hash = number[][][]

export default function Hashing() {
  const [alert, setAlert] = useState<string>('')
  const [warning, setWarning] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [hash, setHash] = useState<Hash>([] as Hash)
  const [hashResult, setHashResult] = useState<string>('')
  const [buffer, setBuffer] = useState<Uint8ClampedArray | null>(null)
  const [utils, setUtils] = useState<Utils>({} as Utils)
  const [engine, setEngine] = useState<Engine>({} as Engine)

  useEffect(() => {
    async function run() {
      // Initialize the WASM module
      const engine = await import("@ezkljs/engine/web/ezkl");
      setEngine(engine)
      await engine.default(undefined, new WebAssembly.Memory({ initial: 20, maximum: 4096, shared: true }))
      // For human readable wasm debug errors call this function
      engine.init_panic_hook()
      // Initialize the utils module
      const utils = await import("../Utils");
      setUtils(utils)
    }
    run()
  })

  const handleSubmitHashing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      message: formData.get('message')
    }
    // Validate form has valid inputs (zod)
    const validatedFormInputs = formDataSchema.safeParse(formInputs)

    if (warning) setWarning('')

    if (!validatedFormInputs.success) {
      setAlert('Please upload all files')
      return
    }

    // Clear alert and warning
    if (alert) setAlert('')

    // Missing data
    if (
      validatedFormInputs.data.message === null
    ) {
      setAlert('Please upload all files')
      return
    }

    setLoading(true)

    /* ================== ENGINE API ====================== */
    utils.handleGenHashButton(validatedFormInputs.data.message)
      .then(({ output, executionTime }) => {
        setBuffer(output)

        // Update result based on the outcome
        setHashResult(
          output
            ? `Hash generation successful. Execution time: ${executionTime} ms`
            : "Hash generation failed"
        )
        const hash = engine.deserialize(output)
        console.log("hash", hash)
        setHash(hash);
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarning(`Hash generation failed: ${error}`)
      })

    setLoading(false)
  }


  return (
    <div className='flex flex-col justify-center items-center h-5/6 pb-20'>
      {buffer && !warning ? (
        <div className='w-10/12 flex flex-col'>
          <h1 className='text-2xl mb-6 '>{hashResult}</h1>
          <p className='break-words'>
            Hash: {stringify(hash)}
          </p>
          <div className="flex w-full justify-center">
            <Button
              className="w-1/2 mr-2"
              type='submit'
              onClick={() => utils.handleFileDownload('hash.txt', new Uint8Array(buffer.buffer))}
            >
              Download Hash
            </Button>
            <Button
              className="w-1/2"
              onClick={() => setBuffer(null)}
            >
              Go back
            </Button>
          </div>
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <HashingArtifactForm handleSubmit={handleSubmitHashing} alert={alert} warning={warning} />
      )}
    </div>
  );
}
// UI Component
function Spinner() {
  return (
    <div className='h-full flex items-center'>
      <_Spinner size='3xl' className='w-28 lg:w-44' />
    </div>
  )
}

function HashingArtifactForm({
  handleSubmit,
  alert,
  warning
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  alert: string
  warning: string
}) {
  return (
    <div className='flex flex-col'>
      <h1 className='text-2xl mb-6 '>Hashing</h1>
      {alert && (
        <Alert color='info' className='mb-6'>
          {alert}
        </Alert>
      )}
      {warning && (
        <Alert color='warning' className='mb-6'>
          {warning}
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        className='flex flex-col flex-grow  justify-between'
      >
        {/* MESSAGE */}
        <div>
          <Label color="white" htmlFor='message' value='Select Message File' />
          <FileInput
            id='message'
            name='message'
            className='my-4'
          />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Generate Hash
        </Button>
      </form>
    </div>
  )
}
