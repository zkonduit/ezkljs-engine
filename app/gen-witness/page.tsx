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
import { formDataSchema } from './parsers'
import { stringify } from 'json-bigint'
import { useSharedResources } from '../EngineContext'

export default function GenWitness() {
    const { engine, utils } = useSharedResources()
    const [openModal, setOpenModal] = useState<string | undefined>()
    const [alert, setAlert] = useState<string>('')
    const [warning, setWarning] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [witness, setWitness] = useState({})
    const [witnessResult, setWitnessResult] = useState<string>('')
    const [buffer, setBuffer] = useState<Uint8Array | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            compiled_onnx: formData.get('compiled_onnx'),
            input: formData.get('input'),
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
            validatedFormInputs.data.compiled_onnx === null ||
            validatedFormInputs.data.input === null
        ) {
            setAlert('Please upload all files')
            return
        }

        let files = {
            compiled_onnx: validatedFormInputs.data.compiled_onnx,
            input: validatedFormInputs.data.input,
        }

        setLoading(true)

        /* ================== ENGINE API ====================== */
        utils
            .handleGenWitnessButton(files as { [key: string]: File })
            .then(({ output, executionTime }) => {
                setBuffer(output)

                // Update result based on the outcome
                setWitnessResult(
                    output
                        ? `Witness generation successful. Execution time: ${executionTime} ms`
                        : 'Witness generation failed',
                )
                const witness = engine.deserialize(output)
                console.log('witness', witness)
                setWitness(witness)
            })
            .catch((error) => {
                console.error('An error occurred:', error)
                setWarning(`Witness generation failed: ${error}`)
            })

        setLoading(false)
    }

    return (
        <div className='flex flex-column justify-around'>
            {buffer && !warning ? (
                <div className='flex flex-col justify-around'>
                    <h1 className='text-2xl mb-6 '>{witnessResult}</h1>

                    <div className='flex flex-col flex-grow w-full items-center justify-around'>
                        <Button
                            className='w-full flex-grow'
                            type='submit'
                            onClick={() => utils.handleFileDownload('witness.json', buffer)}
                        >
                            Download Witness
                        </Button>
                        <Button
                            className='w-full flex-grow mt-4'
                            onClick={() => setOpenModal('default')}
                            data-modal-target='witness-modal'
                            data-modal-toggle='witness-modal'
                        >
                            Show Witness
                        </Button>
                        <Button className='w-full flex-grow mt-4' onClick={() => setBuffer(null)}>
                            Reset
                        </Button>
                        <Modal
                            show={openModal === 'default'}
                            onClose={() => setOpenModal(undefined)}
                        >
                            <Modal.Header>Witness File Content: </Modal.Header>
                            <Modal.Body className='bg-black'>
                                <div className='mt-4 p-4 bg-black-100 rounded'>
                                    <pre className='blackspace-pre-wrap' style={{ fontSize: '13px', color: 'white' }}>
                                        {stringify(witness, null, 6)}
                                    </pre>
                                </div>
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>
            ) : loading ? (
                <Spinner />
            ) : (
                <div className='flex flex-col w-full items-center space-y-4'>
                    <WitnessArtifactForm
                        handleSubmit={handleSubmit}
                        alert={alert}
                        warning={warning}
                    />
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
        compiled_onnx: 'test_network.compiled',
        input: 'input.json',
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
    const compiledOnnxInput =
        document.querySelector<HTMLInputElement>('#compiled_onnx')
    const input = document.querySelector<HTMLInputElement>('#input')

    // Assert that the elements are not null
    assertElement(compiledOnnxInput)
    assertElement(input)

    // Create a new DataTransfer to hold the files
    let dataTransfers: DataTransfer[] = []
    files.forEach((file, idx) => {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        dataTransfers[idx] = dataTransfer
    })

    compiledOnnxInput.files = dataTransfers[0].files
    input.files = dataTransfers[1].files
}

function WitnessArtifactForm({
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
            <h1 className='text-2xl mb-6 '>Witnessing</h1>
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
                {/* COMPILED ONNX */}
                <div>
                    <Label
                        color='white'
                        htmlFor='compiled_onnx'
                        value='Select Compiled Onnx File'
                    />
                    <FileInput id='compiled_onnx' name='compiled_onnx' className='my-4' />
                </div>
                {/* INPUT */}
                <div>
                    <Label color='white' htmlFor='input' value='Select Input File' />
                    <FileInput id='input' name='input' className='my-4' />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'>
                    Generate Witness
                </Button>
            </form>
        </div>
    )
}
