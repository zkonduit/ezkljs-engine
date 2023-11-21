// Example for pages/Page1.js
'use client'
import {
  FileInput,
  Label,
  Button,
  Alert,
  Spinner as _Spinner,
  Modal,
} from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { formDataSchemaEncrypt, formDataSchemaDecrypt } from './parsers'
import { stringify } from 'json-bigint'
import { useSharedResources } from '../EngineContext'

type Utils = typeof import('../Utils')

type Cipher = number[][][]
type DecryptedCipher = number[][]

function showFirstAndLast(str: string, show: number): string {
  if (str.length <= show * 2) return str // If the string is already 10 characters or fewer, return it as is.
  return str.slice(0, show) + ' . . . ' + str.slice(-show)
}

export default function Encryption() {
  const { engine, utils } = useSharedResources()
  const [openModal, setOpenModal] = useState<string | undefined>()
  const props = { openModal, setOpenModal }
  const [alertEncrypt, setAlertEncrypt] = useState<string>('')
  const [warningEncrypt, setWarningEncrypt] = useState<string>('')
  const [alertDecrypt, setAlertDecrypt] = useState<string>('')
  const [warningDecrypt, setWarningDecrypt] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [cipherResult, setCipherResult] = useState('')
  const [cipher, setCipher] = useState<Cipher>([] as Cipher)
  const [bufferCipher, setBufferCipher] = useState<Uint8Array | null>(null)
  const [bufferDecrypt, setBufferDecrypt] = useState<Uint8Array | null>(null)
  const [decrypted, setDecrypted] = useState<DecryptedCipher>(
    [] as DecryptedCipher,
  )
  const [decryptResult, setDecryptResult] = useState('')

  const handleSubmitEncryption = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      pk: formData.get('elgamal_pk'),
      message: formData.get('elgamal_message'),
      r: formData.get('elgamal_r'),
    }
    // Validate form has valid inputs (zod)
    const validatedFormInputs = formDataSchemaEncrypt.safeParse(formInputs)

    if (warningEncrypt) setWarningEncrypt('')

    if (!validatedFormInputs.success) {
      setAlertEncrypt('Please upload all files')
      return
    }

    // Clear alert and warning
    if (alertEncrypt) setAlertEncrypt('')

    // Missing data
    if (
      validatedFormInputs.data.message === null ||
      validatedFormInputs.data.pk === null ||
      validatedFormInputs.data.r === null
    ) {
      setAlertEncrypt('Please upload all files')
      return
    }

    setLoading(true)

    // create file object
    const files = {
      message: validatedFormInputs.data.message,
      pk: validatedFormInputs.data.pk,
      r: validatedFormInputs.data.r,
    }
    /* ================== ENGINE API ====================== */
    utils
      .handleGenElgamalEncryptionButton(files as { [key: string]: File })
      .then(({ output, executionTime }) => {
        setBufferCipher(output)

        // Update result based on the outcome
        setCipherResult(
          output
            ? `Encryption generation successful. Execution time: ${executionTime} ms`
            : 'Encryption generation failed',
        )
        // Deseralize proof buffer
        // TODO - uncomment this line once a new engine bundle is relased
        // with patch to web based serialize/deserialize methods.
        const cipher = engine.deserialize(output)
        console.log('cipher', cipher)
        setCipher(cipher)
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarningEncrypt(`Encryption failed: ${error}`)
      })

    setLoading(false)
  }
  const handleSubmitDecrypt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      cipher: formData.get('cipher'),
      sk: formData.get('elgamal_sk'),
    }
    // Validate form has valid inputs (zod)
    const validatedFormInputs = formDataSchemaDecrypt.safeParse(formInputs)

    if (warningDecrypt) setWarningDecrypt('')

    if (!validatedFormInputs.success) {
      setAlertDecrypt('Please upload all files')
      return
    }

    // Clear alert and warning
    if (alertDecrypt) setAlertDecrypt('')

    // Missing data
    if (
      validatedFormInputs.data.cipher === null ||
      validatedFormInputs.data.sk === null
    ) {
      setAlertDecrypt('Please upload all files')
      return
    }

    setLoading(true)

    // create file object
    const files = {
      cipher: validatedFormInputs.data.cipher,
      sk: validatedFormInputs.data.sk,
    }
    /* ================== ENGINE API ====================== */
    utils
      .handleGenElgamalDecryptionButton(files as { [key: string]: File })
      .then(({ output, executionTime }) => {
        setBufferDecrypt(output)
        // Update result based on the outcome
        setDecryptResult(
          output
            ? 'Decryption successful. Execution time: ' + executionTime + ' ms'
            : 'Decryption failed',
        )
        let decyptedCipher = engine.deserialize(output)
        console.log('decyptedCipher', decyptedCipher)
        setDecrypted(decyptedCipher)
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarningDecrypt(`Decyption process failed with an error: ${error}`)
      })

    setLoading(false)
  }

  return (
    <div className="flex flex-col justify-center items-center h-5/6 pb-20">
      {bufferCipher && !warningEncrypt ? (
        <div className="w-10/12 flex flex-col">
          <h1 className="text-2xl mb-6 ">{cipherResult}</h1>
          <div className="flex w-full justify-center pt-5">
            <Button
              className="w-1/2 mr-3"
              type="submit"
              onClick={() =>
                utils.handleFileDownload('cipher.txt', bufferCipher)
              }
            >
              Download Cipher
            </Button>
            <Button
              className="w-1/2 mr-3"
              onClick={() => props.setOpenModal('default')}
              data-modal-target="witness-modal"
              data-modal-toggle="witness-modal"
            >
              Show Cipher
            </Button>
            <Button className="w-1/2" onClick={() => setBufferCipher(null)}>
              Reset
            </Button>
            <Modal
              show={props.openModal === 'default'}
              onClose={() => props.setOpenModal(undefined)}
            >
              <Modal.Header>Cipher File Content: </Modal.Header>
              <Modal.Body className="bg-black">
                <div className="mt-4 p-4 bg-black-100 rounded border">
                  <pre className="blackspace-pre-wrap">
                    {stringify(cipher, null, 6)}
                  </pre>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      ) : bufferDecrypt && !warningDecrypt ? (
        <div className="w-10/12 flex flex-col">
          <h1 className="text-2xl mb-6 ">{decryptResult}</h1>
          <div className="flex w-full justify-center pt-5">
            <Button
              className="w-1/2 mr-3"
              type="submit"
              onClick={() =>
                utils.handleFileDownload('decrypted.txt', bufferDecrypt)
              }
            >
              Download Message
            </Button>
            <Button
              className="w-1/2 mr-3"
              onClick={() => props.setOpenModal('default')}
              data-modal-target="witness-modal"
              data-modal-toggle="witness-modal"
            >
              Show Message
            </Button>
            <Button className="w-1/2" onClick={() => setBufferDecrypt(null)}>
              Reset
            </Button>
            <Modal
              show={props.openModal === 'default'}
              onClose={() => props.setOpenModal(undefined)}
            >
              <Modal.Header>Decrypted Cipher File Content: </Modal.Header>
              <Modal.Body className="bg-black">
                <div className="mt-4 p-4 bg-black-100 rounded border">
                  <pre className="whitespace-pre-wrap">
                    {stringify(decrypted, null, 5)}
                  </pre>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <div className="w-full flex flex-col items-stretch">
          <div className="w-full">
            <ElgamalRandomVar utils={utils} />
          </div>
          <div className="flex space-x-8 w-full">
            <EncryptionArtifactForm
              handleSubmit={handleSubmitEncryption}
              alert={alertEncrypt}
              warning={warningEncrypt}
            />
            <DecryptionArtifactForm
              handleSubmit={handleSubmitDecrypt}
              alert={alertDecrypt}
              warning={warningDecrypt}
            />
          </div>
          <Button
            type="submit"
            color="dark"
            className="self-center mt-4 w-full"
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
    <div className="h-full flex items-center">
      <_Spinner size="3xl" className="w-28 lg:w-44" />
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
    pk: 'pk.txt',
    message: 'message.txt',
    r: 'r.txt',
    cipher: 'elgamal_cipher.txt',
    sk: 'sk.txt',
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
  const pk = document.querySelector<HTMLInputElement>('#elgamal_pk')
  const message = document.querySelector<HTMLInputElement>('#elgamal_message')
  const r = document.querySelector<HTMLInputElement>('#elgamal_r')
  const cipher = document.querySelector<HTMLInputElement>('#cipher')
  const sk = document.querySelector<HTMLInputElement>('#elgamal_sk')

  // Assert that the elements are not null
  assertElement(pk)
  assertElement(message)
  assertElement(r)
  assertElement(cipher)
  assertElement(sk)

  // Create a new DataTransfer to hold the files
  let dataTransfers: DataTransfer[] = []
  files.forEach((file, idx) => {
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    dataTransfers[idx] = dataTransfer
  })

  pk.files = dataTransfers[0].files
  message.files = dataTransfers[1].files
  r.files = dataTransfers[2].files
  cipher.files = dataTransfers[3].files
  sk.files = dataTransfers[4].files

  // // If the 'vk' file is different, you'd handle it separately
  // const vkFile = await fetchAndCreateFile(`/${sampleFileNames.vk}`, sampleFileNames.vk);
  // const vkDataTransfer = new DataTransfer();
  // vkDataTransfer.items.add(vkFile);

  // Trigger any onChange or update logic if necessary
  // This part depends on your application. For example, you might need to call a state setter function if you're using React state to track file input values.
}

function ElgamalRandomVar({ utils }: { utils: Utils }) {
  return (
    <div className="flex flex-col justify-center items-center h-4/6 pb-0">
      <h1 className="text-2xl mb-3 ">Generate Random Elgamal Variables</h1>
      <Label
        color="white"
        htmlFor="elgamal_pk"
        value="Generates a secure Public Key, Secret Key and Random Seed"
      />
      <Button
        type="submit"
        color="dark"
        className="w-full self-center mt-4"
        id="genREVButton"
        onClick={() => {
          const result = utils.handleGenREVButton()
          utils.ElgamalZipFileDownload('vars.zip', result)
        }}
      >
        Download Zip
      </Button>
    </div>
  )
}

function EncryptionArtifactForm({
  handleSubmit,
  alert,
  warning,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  alert: string
  warning: string
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl mb-6 ">Encrypting</h1>
      {alert && (
        <Alert color="info" className="mb-6">
          {alert}
        </Alert>
      )}
      {warning && (
        <Alert color="warning" className="mb-6">
          {warning}
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow  justify-between"
      >
        {/* PK */}
        <div>
          <Label
            color="white"
            htmlFor="elgamal_pk"
            value="Select Public Key File"
          />
          <FileInput id="elgamal_pk" name="elgamal_pk" className="my-4" />
        </div>
        {/* MESSAGE */}
        <div>
          <Label
            color="white"
            htmlFor="elgamal_message"
            value="Select Message File"
          />
          <FileInput
            id="elgamal_message"
            name="elgamal_message"
            className="my-4"
          />
        </div>
        {/* RANDOM SEED */}
        <div>
          <Label
            color="white"
            htmlFor="elgamal_r"
            value="Select Random Seed File"
          />
          <FileInput id="elgamal_r" name="elgamal_r" className="my-4" />
        </div>
        <Button type="submit" color="dark" className="w-full self-center mt-4">
          Generate Cipher
        </Button>
      </form>
    </div>
  )
}
function DecryptionArtifactForm({
  handleSubmit,
  alert,
  warning,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  alert: string
  warning: string
}) {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl mb-6 ">Decrypting</h1>
      {alert && (
        <Alert color="info" className="mb-6">
          {alert}
        </Alert>
      )}
      {warning && (
        <Alert color="warning" className="mb-6">
          {warning}
        </Alert>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-grow justify-between"
      >
        {/* CIPHER */}
        <div>
          <Label color="white" htmlFor="cipher" value="Select Cipher File" />
          <FileInput id="cipher" name="cipher" className="my-4" />
        </div>
        {/* SECRET KEY */}
        <div>
          <Label
            color="white"
            htmlFor="elgamal_sk"
            value="Select Secret Key File"
          />
          <FileInput id="elgamal_sk" name="elgamal_sk" className="my-4" />
        </div>
        <Button type="submit" color="dark" className="w-full self-center mt-4">
          Decrypt Cipher
        </Button>
      </form>
    </div>
  )
}
