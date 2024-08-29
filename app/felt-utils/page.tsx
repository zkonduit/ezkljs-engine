// Example for pages/Page1.js
'use client'
import {
  TextInput,
  Label,
  Button,
  Alert,
  Spinner as _Spinner,
} from 'flowbite-react'
import React, { useState } from 'react'
import {
  formDataSchemaFloatToFelt,
  formDataSchemaFeltToInt,
  formDataSchemaFeltToFloat,
  formDataSchemaFeltToFelt,
} from './parsers'
import { useSharedResources } from '../EngineContext'
import { stringify } from 'json-bigint'

type Utils = typeof import('../Utils')
type Engine = typeof import('@ezkljs/engine/web/ezkl')

type Cipher = number[][][]
type DecryptedCipher = number[][]

export default function FeltUtils() {
  const { engine } = useSharedResources()

  return (
    <div className='flex flex-wrap h-screen'>
      <div className='flex flex-col w-1/2 h-1/2 justify-center items-center p-4'>
        <div className='w-full h-full overflow-auto'>
          <FloatToFeltForm engine={engine} />
        </div>
      </div>
      <div className='flex flex-col w-1/2 h-1/2 justify-center items-center p-4'>
        <div className='w-full h-full overflow-auto'>
          <FeltToFloatForm engine={engine} />
        </div>
      </div>
      <div className='flex flex-col w-full h-1/2 justify-center items-center p-4'>
        <div className='w-full h-full overflow-auto'>
          <FeltToIntForm engine={engine} />
        </div>
      </div>
    </div>
  )
}

function FloatToFeltForm({ engine }: { engine: Engine }) {
  const [alertFloatToFelt, setAlertFloatToFelt] = useState<string>('')
  const [warningFloatToFelt, setWarningFloatToFelt] = useState<string>('')
  const [output, setOutput] = useState<string>('')

  const handleSubmitFloatToFelt = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      fp: formData.get('fp')?.toString(),
      scale: formData.get('scale')?.toString(),
    }

    // Missing data
    if (formInputs.fp === '' || formInputs.scale === '') {
      setAlertFloatToFelt('Please enter a value in all fields')
      return
    }
    console.log('formInputs', formInputs)
    // Validate form has valid inputs (zod)
    const validatedFormInputs =
      formDataSchemaFloatToFelt.safeParse(formInputs)

    if (warningFloatToFelt) setWarningFloatToFelt('')

    if (!validatedFormInputs.success) {
      let alertString = ''
      validatedFormInputs.error.issues.map((issue) => {
        console.log('issue', issue)
        alertString += issue.message + '\n'
      })
      setAlertFloatToFelt(alertString)
      return
    }

    // Clear alert and warning
    if (alertFloatToFelt) setAlertFloatToFelt('')
    setWarningFloatToFelt('')
    // Missing
    if (
      validatedFormInputs.data.fp === null ||
      validatedFormInputs.data.scale === null
    ) {
      setAlertFloatToFelt('Please upload all files')
      return
    }

    // create file object
    const entries = {
      fp: validatedFormInputs.data.fp,
      scale: validatedFormInputs.data.scale,
    }

    console.log('entries', entries)
    /* ================== ENGINE API ====================== */
    try {
      const U64s = engine.floatToFelt(parseFloat(entries.fp), entries.scale)
      const deserializedU64s = engine.deserialize(U64s)
      setOutput(stringify(deserializedU64s, null, 4))
      console.log('U64s', deserializedU64s)
    } catch (error) {
      console.error('An error occurred:', error)
      setWarningFloatToFelt(`Float to Felt generation failed: ${error}`)
    }
  }

  return (
    <div className=''>
      <h1 className='text-2xl mb-6 '>Float {'->'} Felt</h1>
      {alertFloatToFelt && (
        <Alert color='info' className='mb-6'>
          {alertFloatToFelt}
        </Alert>
      )}
      {warningFloatToFelt && (
        <Alert color='warning' className='mb-6'>
          {warningFloatToFelt}
        </Alert>
      )}
      <form
        onSubmit={handleSubmitFloatToFelt}
        className='flex flex-col flex-grow justify-between'
      >
        {/* FLOATING POINT */}
        <div>
          <Label color='white' htmlFor='fp' value='Floating Point' />
          <TextInput type='test' id='fp' name='fp' className='my-4' />
        </div>
        {/* SCALE */}
        <div>
          <Label color='white' htmlFor='scale' value='Scale' />
          <TextInput type='number' id='scale' name='scale' className='my-4' />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Generate Felt
        </Button>
      </form>
      {/* Output section */}
      {output && (
        <div className='mt-4 p-4 bg-black-100 rounded border'>
          <pre className='whitespace-pre-wrap'>{output}</pre>
        </div>
      )}
    </div>
  )
}

function FeltToFloatForm({ engine }: { engine: Engine }) {
  const [alert, setAlert] = useState<string>('')
  const [warning, setWarning] = useState<string>('')
  const [output, setOutput] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      Felt: formData.get('Felt')?.toString(),
      scale: formData.get('scale')?.toString(),
    }
    console.log('formInputs', formInputs)

    // Missing data
    if (formInputs.Felt === '' || formInputs.scale === '') {
      setAlert('Please enter a value in all fields')
      return
    }
    console.log('formInputs', formInputs)
    // Validate form has valid inputs (zod)
    const validatedFormInputs =
      formDataSchemaFeltToFloat.safeParse(formInputs)

    if (warning) setWarning('')

    if (!validatedFormInputs.success) {
      let alertString = ''
      validatedFormInputs.error.issues.map((issue) => {
        console.log('issue', issue)
        alertString += issue.message + '\n'
      })
      setAlert(alertString)
      return
    }

    // Clear alert and warning
    if (alert) setAlert('')
    setWarning('')
    // Missing
    if (
      validatedFormInputs.data.Felt === null ||
      validatedFormInputs.data.scale === null
    ) {
      setAlert('Please upload all files')
      return
    }

    // create file object
    const entries = {
      Felt: validatedFormInputs.data.Felt,
      scale: validatedFormInputs.data.scale,
    }

    console.log('entries', entries)
    /* ================== ENGINE API ====================== */
    try {
      const float = engine.feltToFloat(
        engine.serialize(entries.Felt),
        entries.scale,
      )
      setOutput(stringify(float, null, 4))
      console.log('float', float)
    } catch (error) {
      console.error('An error occurred:', error)
      setWarning(`Felt to Float generation failed: ${error}`)
    }
  }

  return (
    <div className=''>
      <h1 className='text-2xl mb-6 '>Felt {'->'} Float</h1>
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
        {/* Felt */}
        <div>
          <Label color='white' htmlFor='Felt' value='Felt String' />
          <TextInput type='text' id='Felt' name='Felt' className='my-4' />
        </div>
        {/* SCALE */}
        <div>
          <Label color='white' htmlFor='scale' value='Scale' />
          <TextInput type='number' id='scale' name='scale' className='my-4' />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Generate Floating Point
        </Button>
      </form>
      {/* Output section */}
      {output && (
        <div className='mt-4 p-4 bg-black-100 rounded border'>
          <pre className='whitespace-pre-wrap'>{output}</pre>
        </div>
      )}
    </div>
  )
}

function FeltToIntForm({ engine }: { engine: Engine }) {
  const [alert, setAlert] = useState<string>('')
  const [warning, setWarning] = useState<string>('')
  const [output, setOutput] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      Felt: formData.get('Felt')?.toString(),
    }

    // Missing data
    if (formInputs.Felt === '') {
      setAlert('Please enter a value in all fields')
      return
    }
    console.log('formInputs', formInputs)
    // Validate form has valid inputs (zod)
    const validatedFormInputs = formDataSchemaFeltToInt.safeParse(formInputs)

    if (warning) setWarning('')

    if (!validatedFormInputs.success) {
      let alertString = ''
      validatedFormInputs.error.issues.map((issue) => {
        console.log('issue', issue)
        alertString += issue.message + '\n'
      })
      setAlert(alertString)
      return
    }

    // Clear alert and warning
    if (alert) setAlert('')
    setWarning('')
    // Missing
    if (validatedFormInputs.data.Felt === null) {
      setAlert('Please upload all files')
      return
    }

    // create file object
    const entries = {
      Felt: validatedFormInputs.data.Felt,
    }

    console.log('entries', entries)
    /* ================== ENGINE API ====================== */
    try {
      const int = engine.feltToInt(engine.serialize(entries.Felt))
      const intDeserialized = engine.deserialize(int)
      setOutput(intDeserialized.toString())
      console.log('int deserialized', intDeserialized.toString())
      console.log('int', int)
    } catch (error) {
      console.error('An error occurred:', error)
      setWarning(`Felt to Int generation failed: ${error}`)
    }
  }

  return (
    <div className=''>
      <h1 className='text-2xl mb-6 '>Felt {'->'} Int</h1>
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
        {/* Felt */}
        <div>
          <Label color='white' htmlFor='Felt' value='Felt String' />
          <TextInput type='text' id='Felt' name='Felt' className='my-4' />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Generate Integer
        </Button>
      </form>
      {/* Output section */}
      {output && (
        <div className='mt-4 p-4 bg-black-100 rounded border'>
          <pre className='whitespace-pre-wrap'>{output}</pre>
        </div>
      )}
    </div>
  )
}

