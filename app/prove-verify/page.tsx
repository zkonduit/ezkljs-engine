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
import { formDataSchemaProve, formDataSchemaVerify } from './parsers'
import { stringify } from "json-bigint";
import { useSharedResources } from '../EngineContext';

// Truncate Proof string
function showFirstAndLast(str: string, show: number): string {
  if (str.length <= show * 2) return str // If the string is already 10 characters or fewer, return it as is.
  return str.slice(0, show) + ' . . . ' + str.slice(-show)
}

export default function ProveVerify() {
  const { engine, utils } = useSharedResources();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };
  const [alertProof, setAlertProof] = useState<string>('')
  const [warningProof, setWarningProof] = useState<string>('')
  const [alertVerify, setAlertVerify] = useState<string>('')
  const [warningVerify, setWarningVerify] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [proofResult, setProofResult] = useState('')
  const [proof, setProof] = useState({})
  const [buffer, setBuffer] = useState<Uint8Array | null>(null)
  const [verifyResult, setVerifyResult] = useState<string>('');

  const handleSubmitProve = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      witness: formData.get('witness'),
      pk: formData.get('pk'),
      compiled_onnx: formData.get('compiled_onnx'),
      srs: formData.get('srs'),
    }
    // Validate form has valid inputs (zod)
    const validatedFormInputs = formDataSchemaProve.safeParse(formInputs)

    if (warningProof) setWarningProof('')

    if (!validatedFormInputs.success) {
      setAlertProof('Please upload all files')
      return
    }

    // Clear alert and warning
    if (alertProof) setAlertProof('')

    // Missing data
    if (
      validatedFormInputs.data.witness === null ||
      validatedFormInputs.data.pk === null ||
      validatedFormInputs.data.compiled_onnx === null ||
      validatedFormInputs.data.srs === null
    ) {
      setAlertProof('Please upload all files')
      return
    }

    setLoading(true)

    // create file object
    const files = {
      data: validatedFormInputs.data.witness,
      pk: validatedFormInputs.data.pk,
      model: validatedFormInputs.data.compiled_onnx,
      srs: validatedFormInputs.data.srs,
    }
    /* ================== ENGINE API ====================== */
    utils.handleGenProofButton(files as { [key: string]: File })
      .then(({ output, executionTime }) => {
        setBuffer(output)



        // Update result based on the outcome
        setProofResult(
          output
            ? `Proof generation successful. Execution time: ${executionTime} ms`
            : "Proof generation failed"
        )
        // Deseralize proof buffer
        // TODO - uncomment this line once a new engine bundle is relased
        // with patch to web based serialize/deserialize methods.
        const proof = engine.deserialize(output)
        console.log("proof", proof)
        setProof(proof);
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarningProof(`Proof generation failed: ${error}`)
      })

    setLoading(false)
  }
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
      srs: validatedFormInputs.data.srs
    }
    /* ================== ENGINE API ====================== */
    utils.handleVerifyButton(files as { [key: string]: File })
      .then(({ output, executionTime }) => {
        // Update result based on the outcome
        setVerifyResult(
          output
            ? 'Verification successful. Execution time: ' + executionTime + ' ms'
            : 'Verification failed'
        )
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarningVerify(`Verification process failed with an error: ${error}`)
      })

    setLoading(false)
  }


  return (
    <div className='flex flex-col justify-center items-center h-5/6 pb-20'>
      {buffer && !warningProof ? (
        <div className='w-10/12 flex flex-col'>
          <h1 className='text-2xl mb-6 '>{proofResult}</h1>
          <div className="flex w-full justify-center pt-7">
            <Button
              className="w-1/2 mr-3"
              type='submit'
              onClick={() => utils.handleFileDownload('test.pf', buffer)}
            >
              Download Proof File
            </Button>
            <Button
              className="w-1/2 mr-3"
              onClick={() => props.setOpenModal('default')}
              data-modal-target="witness-modal"
              data-modal-toggle="witness-modal"
            >
              Show Proof
            </Button>
            <Button
              className="w-1/2"
              onClick={() => setBuffer(null)}
            >
              Reset
            </Button>
            <Modal
              show={props.openModal === 'default'}
              onClose={() => props.setOpenModal(undefined)}
            >
              <Modal.Header>Proof File Content: </Modal.Header>
              <Modal.Body className="bg-black">
                <div className='mt-4 p-4 bg-black-100 rounded border'>
                  <pre className='blackspace-pre-wrap'>{stringify(proof, null, 6)}</pre>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      ) : verifyResult && !warningVerify ? (
        <div className='w-10/12 flex flex-col'>
          <h1 className='text-2xl mb-6 '>{verifyResult}</h1>
          <div className="flex w-full justify-center">
            <Button
              className="w-full"
              onClick={() => setVerifyResult("")}
            >
              Reset
            </Button>
          </div>
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <div className='flex justify-between w-full items-stretch space-x-8'>
          <ProvingArtifactForm handleSubmit={handleSubmitProve} alert={alertProof} warning={warningProof} />
          <VerifyingArtifactForm handleSubmit={handleSubmitVerify} alert={alertVerify} warning={warningVerify} />
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

function ProvingArtifactForm({
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
      <h1 className='text-2xl mb-6 '>Proving</h1>
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
        {/* WITNESS */}
        <div>
          <Label color="white" htmlFor='witness' value='Select Witness File' />
          <FileInput
            id='witness'
            name='witness'
            className='my-4'
          />
        </div>
        {/* PK */}
        <div>
          <Label color="white" htmlFor='pk' value='Select Proving Key File' />
          <FileInput
            id='pk'
            name='pk'
            className='my-4'
          />
        </div>
        {/* COMPILED ONNX MODEL */}
        <div>
          <Label color="white" htmlFor='compiled_onnx' value='Select Compiled Onnx File' />
          <FileInput
            id='compiled_onnx'
            name='compiled_onnx'
            className='my-4'
          />
        </div>
        {/* SRS */}
        <div>
          <Label color="white" htmlFor='srs' value='Select SRS File' />
          <FileInput
            id='srs'
            name='srs'
            className='my-4'
          />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Generate Proof
        </Button>
      </form>
    </div>
  )
}
function VerifyingArtifactForm({
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
        className='flex flex-col flex-grow  justify-between'
      >
        {/* PROOF */}
        <div>
          <Label color="white" htmlFor='proof' value='Select Proof File' />
          <FileInput
            id='proof'
            name='proof'
            className='my-4'
          />
        </div>
        {/* SETTINGS */}
        <div>
          <Label color="white" htmlFor='settings' value='Select Settings File' />
          <FileInput
            id='settings'
            name='settings'
            className='my-4'
          />
        </div>
        {/* VK */}
        <div>
          <Label color="white" htmlFor='vk' value='Select VK File' />
          <FileInput
            id='vk'
            name='vk'
            className='my-4'
          />
        </div>
        {/* SRS */}
        <div>
          <Label color="white" htmlFor='srs' value='Select SRS File' />
          <FileInput
            id='srs'
            name='srs'
            className='my-4'
          />
        </div>
        <Button type='submit' color='dark' className='w-full self-center mt-4'>
          Verify
        </Button>
      </form>
    </div>
  )
}
