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

type Utils = typeof import("../Utils")
type Engine = typeof import("@ezkljs/engine/web/ezkl")

interface Proof {
  proof: string;
  instances: string;
}

// Truncate Proof string
function showFirstAndLast(str: string, show: number): string {
  if (str.length <= show * 2) return str // If the string is already 10 characters or fewer, return it as is.
  return str.slice(0, show) + ' . . . ' + str.slice(-show)
}

export default function ProveVerify() {
  const [alert, setAlert] = useState<string>('')
  const [warning, setWarning] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [proofResult, setProofResult] = useState('')
  const [proof, setProof] = useState<Proof>({} as Proof)
  const [buffer, setBuffer] = useState<Uint8Array | null>(null)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formInputs = {
      witness: formData.get('witness'),
      pk: formData.get('pk'),
      compiled_onnx: formData.get('compiled_onnx'),
      srs: formData.get('srs'),
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
      validatedFormInputs.data.witness === null ||
      validatedFormInputs.data.pk === null ||
      validatedFormInputs.data.compiled_onnx === null ||
      validatedFormInputs.data.srs === null
    ) {
      setAlert('Please upload all files')
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
        // const proof = engine.deserialize(output)
        const string = new TextDecoder().decode(output);
        const proof = parse(string);
        console.log("proof", proof)
        let prooObj: Proof = {
          proof: proof.proof.toString(),
          instances: stringify(proof.instances, null, 4)
        }
        setProof(prooObj);
      })
      .catch((error) => {
        console.error('An error occurred:', error)
        setWarning(`Proof generation failed: ${error}`)
      })

    setLoading(false)
  }


  return (
    <div className='flex justify-center h-5/6 pb-20'>
      {buffer && !warning ? (
        <div className='w-10/12 flex flex-col'>
          <h1 className='text-2xl mb-6 '>{proofResult}</h1>
          <p className='break-words'>
            Proof string: {showFirstAndLast(proof.proof, 10)}
          </p>
          <p className='break-words'>
            Instances: {proof.instances}
          </p>
          <div className="flex w-full justify-center">
            <Button
              className="w-1/2 mr-2"
              type='submit'
              onClick={() => utils.handleFileDownload('test.pf', buffer)}
            >
              Download Proof File
            </Button>
            <Button
              className="w-1/2"
              onClick={() => setBuffer(null)}
            >
              Generate a new proof
            </Button>
          </div>
        </div>
      ) : loading ? (
        <Spinner />
      ) : (
        <ProvingArtifactForm handleSubmit={handleSubmit} alert={alert} warning={warning} />
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
      <h1 className='text-2xl mb-6 '>Submit Proving Artifacts</h1>
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
