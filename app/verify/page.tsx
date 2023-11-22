// Example for pages/Page1.js
'use client'
import {
  FileInput,
  Label,
  Button,
  Alert,
  Spinner as _Spinner,
} from 'flowbite-react'
import React, { useState } from 'react'
import { formDataSchemaVerify } from './parsers'
import { useSharedResources } from '../EngineContext'

export default function Verify() {
  const { utils } = useSharedResources()
  const [alertVerify, setAlertVerify] = useState<string>('')
  const [warningVerify, setWarningVerify] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [verifyResult, setVerifyResult] = useState<string>('')

  const handleSubmitVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      proof: formData.get('proof'),
      vk: formData.get('vk'),
      settings: formData.get('settings'),
      srs: formData.get('srs'),
    }
    // Validate form has valid inputs (zod)
    const validatedFormInputs = formDataSchemaVerify.safeParse(formInputs)

    if (warningVerify) setWarningVerify('')

    if (!validatedFormInputs.success) {
      setAlertVerify('Please upload all files')
      return
    }

    // Clear alert and warning
    if (alertVerify) setAlertVerify('')

    // Missing data
    if (
      validatedFormInputs.data.proof === null ||
      validatedFormInputs.data.vk === null ||
      validatedFormInputs.data.settings === null ||
      validatedFormInputs.data.srs === null
    ) {
      setAlertVerify('Please upload all files')
      return
    }

    setLoading(true)

    // create file object
    const files = {
      proof: validatedFormInputs.data.proof,
      vk: validatedFormInputs.data.vk,
      settings: validatedFormInputs.data.settings,
      srs: validatedFormInputs.data.srs,
    }
    /* ================== ENGINE API ====================== */
    utils
      .handleVerifyButton(files as { [key: string]: File })
      .then(({ output, executionTime }) => {
        // Update result based on the outcome
        setVerifyResult(
          output
            ? 'Verification successful. Execution time: ' +
            executionTime +
            ' ms'
            : 'Verification failed',
        )
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarningVerify(`Verification process failed with an error: ${error}`)
      })

    setLoading(false)
  }

  return (
    <div className='flex flex-column justify-around'>
      {verifyResult && !warningVerify ? (
        <div className='flex flex-col justify-around'>
          <h1 className='text-2xl mb-4 '>{verifyResult}</h1>
          <div className='flex flex-col flex-grow w-full items-center justify-around'>
            <Button className='w-full flex-grow' onClick={() => setVerifyResult('')}>
              Reset
            </Button>
          </div>
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col justify-between w-full items-center space-y-4'>
          <div className='flex justify-between w-full items-stretch space-x-8'>
            <VerifyingArtifactForm
              handleSubmit={handleSubmitVerify}
              alert={alertVerify}
              warning={warningVerify}
            />
          </div>
          <Button
            type='submit'
            color='dark'
            className='self-center mt-4 w-full'
            onClick={() => populateWithSampleFiles()}
          >
            Populate with sample files
          </Button>
        </div>
      )}
    </div>
  )
}
// UI Component
function Spinner() {
  return (
    <div className='h-full flex items-center'>
      <_Spinner size='3xl' className='w-28 lg:w-44' />
    </div>
  )
}

async function populateWithSampleFiles() {
  // Helper to assert that the element is not null
  function assertElement<T extends Element>(
    element: T | null,
  ): asserts element is T {
    if (element === null) {
      throw new Error('Element not found')
    }
  }

  // Names of the sample files in the public directory
  const sampleFileNames: { [key: string]: string } = {
    srs: 'kzg',
    proof: 'test.pf',
    settings: 'settings.json',
    vk: 'test.key',
  }

  // Helper function to fetch and create a file object from a public URL
  const fetchAndCreateFile = async (
    path: string,
    filename: string,
  ): Promise<File> => {
    const response = await fetch(path)
    const blob = await response.blob()
    return new File([blob], filename, { type: blob.type })
  }

  // Fetch each sample file and create a File object
  const filePromises = Object.entries(sampleFileNames).map(([key, filename]) =>
    fetchAndCreateFile(`/data/1l_mlp/${filename}`, filename),
  )

  // Wait for all files to be fetched and created
  const files = await Promise.all(filePromises)

  // Select the file input elements and assign the FileList to each
  const proof = document.querySelector<HTMLInputElement>('#proof')
  const settings = document.querySelector<HTMLInputElement>('#settings')
  const vk = document.querySelector<HTMLInputElement>('#vk')
  const srsVerify = document.querySelector<HTMLInputElement>('#srs_verify')

  // Assert that the elements are not null
  assertElement(proof)
  assertElement(settings)
  assertElement(vk)
  assertElement(srsVerify)

  // Create a new DataTransfer to hold the files
  let dataTransfers: DataTransfer[] = []
  files.forEach((file, idx) => {
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    dataTransfers[idx] = dataTransfer
  })

  srsVerify.files = dataTransfers[0].files
  proof.files = dataTransfers[1].files
  settings.files = dataTransfers[2].files
  vk.files = dataTransfers[3].files
}

function VerifyingArtifactForm({
  handleSubmit,
  alert,
  warning,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  alert: string
  warning: string
}) {
  return (
    <div className='flex flex-col'>
      <h1 className='text-2xl mb-6 '>Verifying</h1>
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
        className='flex flex-col flex-grow justify-between'
      >
        {/* PROOF */}
        <div>
          <Label color='white' htmlFor='proof' value='Select Proof File' />
          <FileInput id='proof' name='proof' className='my-4' />
        </div>
        {/* SETTINGS */}
        <div>
          <Label
            color='white'
            htmlFor='settings'
            value='Select Settings File'
          />
          <FileInput id='settings' name='settings' className='my-4' />
        </div>
        {/* VK */}
        <div>
          <Label color='white' htmlFor='vk' value='Select VK File' />
          <FileInput id='vk' name='vk' className='my-4' />
        </div>
        {/* SRS */}
        <div>
          <Label color='white' htmlFor='srs' value='Select SRS File' />
          <FileInput id='srs_verify' name='srs' className='my-4' />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Verify
        </Button>
      </form>
    </div>
  )
}
