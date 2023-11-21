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
import React, { useState } from 'react'
import { formDataSchemaProve } from './parsers'
import { stringify } from "json-bigint";
import { useSharedResources } from '../EngineContext';

export default function Prove() {
  const { engine, utils } = useSharedResources();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const props = { openModal, setOpenModal };
  const [alertProof, setAlertProof] = useState<string>('')
  const [warningProof, setWarningProof] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [proofResult, setProofResult] = useState('')
  const [proof, setProof] = useState({})
  const [buffer, setBuffer] = useState<Uint8Array | null>(null)

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
      ) : loading ? (
        <Spinner />
      ) : (
        <div className='flex flex-col justify-between w-full items-center space-y-4'>
          <div className='flex justify-between w-full items-stretch space-x-8'>
            <ProvingArtifactForm handleSubmit={handleSubmitProve} alert={alertProof} warning={warningProof} />
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
    witness: 'test.witness.json',
    pk: 'test.provekey',
    compiled_onnx: 'test_network.compiled',
    srs: 'kzg'
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
  const witness = document.querySelector<HTMLInputElement>('#witness');
  const pk = document.querySelector<HTMLInputElement>('#pk');
  const compiled_onnx = document.querySelector<HTMLInputElement>('#compiled_onnx');
  const srsProve = document.querySelector<HTMLInputElement>('#srs_prove');

  // Assert that the elements are not null
  assertElement(witness);
  assertElement(pk);
  assertElement(compiled_onnx);
  assertElement(srsProve);

  // Create a new DataTransfer to hold the files
  let dataTransfers: DataTransfer[] = [];
  files.forEach(
    (file, idx) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file)
      dataTransfers[idx] = dataTransfer;
    }

  );


  witness.files = dataTransfers[0].files;
  pk.files = dataTransfers[1].files;
  compiled_onnx.files = dataTransfers[2].files;
  srsProve.files = dataTransfers[3].files;
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
            id='srs_prove'
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
