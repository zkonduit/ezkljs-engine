// Example for pages/Page1.js
'use client'
import {
  FileInput,
  Label,
  Button,
  Alert,
  Spinner as _Spinner,
  Modal
} from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { formDataSchema } from './parsers'
import { stringify } from "json-bigint";
import { useSharedResources } from '../EngineContext';

type Hash = number[][][]

export default function Hashing() {
  const { engine, utils } = useSharedResources();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };
  const [alert, setAlert] = useState<string>('')
  const [warning, setWarning] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [hash, setHash] = useState<Hash>([] as Hash)
  const [hashResult, setHashResult] = useState<string>('')
  const [buffer, setBuffer] = useState<Uint8ClampedArray | null>(null)

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
          <div className="flex w-full justify-center pt-5">
            <Button
              className="w-1/2 mr-3"
              type='submit'
              onClick={() => utils.handleFileDownload('hash.txt', new Uint8Array(buffer.buffer))}
            >
              Download Hash
            </Button>
            <Button
              className="w-1/2 mr-3"
              onClick={() => props.setOpenModal('default')}
              data-modal-target="witness-modal"
              data-modal-toggle="witness-modal"
            >
              Show Hash
            </Button>
            <Button
              className="w-1/2"
              onClick={() => setBuffer(null)}
            >
              Reset
            </Button>
            <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)} >
              <Modal.Header>Hash File Content: </Modal.Header>
              <Modal.Body className="bg-black">
                <div className='mt-4 p-4 bg-black-100 rounded border'>
                  <pre className='blackspace-pre-wrap'>{stringify(hash, null, 6)}</pre>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col justify-between w-full items-center space-y-4'>
          <HashingArtifactForm handleSubmit={handleSubmitHashing} alert={alert} warning={warning} />
          <Button
            type='submit'
            color='dark'
            className='self-center mt-4 w-full'
            onClick={() => populateWithSampleFiles()}
          >
            Populate with sample file
          </Button>
        </div>
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

async function populateWithSampleFiles() {
  // Helper to assert that the element is not null
  function assertElement<T extends Element>(element: T | null): asserts element is T {
    if (element === null) {
      throw new Error('Element not found');
    }
  }

  // Names of the sample files in the public directory
  const sampleFileNames: { [key: string]: string } = {
    message: 'message.txt'
  };

  // Helper function to fetch and create a file object from a public URL
  const fetchAndCreateFile = async (path: string, filename: string): Promise<File> => {
    const response = await fetch(path);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  // Fetch each sample file and create a File object
  const filePromises = Object.entries(sampleFileNames).map(([key, filename]) =>
    fetchAndCreateFile(`/data/1l_mlp/${filename}`, filename)
  );

  // Wait for all files to be fetched and created
  const files = await Promise.all(filePromises);

  // Select the file input elements and assign the FileList to each
  const message = document.querySelector<HTMLInputElement>('#message');

  // Assert that the elements are not null
  assertElement(message);

  // Create a new DataTransfer to hold the files
  let dataTransfers: DataTransfer[] = [];
  files.forEach(
    (file, idx) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file)
      dataTransfers[idx] = dataTransfer;
    }

  );


  message.files = dataTransfers[0].files;

  // // If the 'vk' file is different, you'd handle it separately
  // const vkFile = await fetchAndCreateFile(`/${sampleFileNames.vk}`, sampleFileNames.vk);
  // const vkDataTransfer = new DataTransfer();
  // vkDataTransfer.items.add(vkFile);

  // Trigger any onChange or update logic if necessary
  // This part depends on your application. For example, you might need to call a state setter function if you're using React state to track file input values.
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
