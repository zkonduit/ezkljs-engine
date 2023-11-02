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
import { formDataSchemaGenVk, formDataSchemaGenPk } from './parsers'
import { useSharedResources } from '../EngineContext';

export default function Setup() {
    const { engine, utils } = useSharedResources();
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
    const [alertGenVk, setAlertGenVk] = useState<string>('')
    const [warningGenVk, setWarningGenVk] = useState<string>('')
    const [alertGenPk, setAlertGenPk] = useState<string>('')
    const [warningGenPk, setWarningGenPk] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [genVkResult, setGenVkResult] = useState('')
    const [genPkResult, setGenPkResult] = useState('')
    const [bufferVk, setBufferVk] = useState<Uint8Array | null>(null)
    const [bufferPk, setBufferPk] = useState<Uint8Array | null>(null)

    const handleSubmitGenVk = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            compiled_onnx: formData.get('compiled_onnx'),
            srs: formData.get('srs'),
        }
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaGenVk.safeParse(formInputs)

        if (warningGenVk) setWarningGenVk('')

        if (!validatedFormInputs.success) {
            setAlertGenVk('Please upload all files')
            return
        }

        // Clear alert and warning
        if (alertGenVk) setAlertGenVk('')

        // Missing data
        if (
            validatedFormInputs.data.compiled_onnx === null ||
            validatedFormInputs.data.srs === null
        ) {
            setAlertGenVk('Please upload all files')
            return
        }

        setLoading(true)

        // create file object
        const files = {
            compiled_onnx: validatedFormInputs.data.compiled_onnx,
            srs: validatedFormInputs.data.srs,
        }
        /* ================== ENGINE API ====================== */
        utils.handleGenVkButton(files as { [key: string]: File })
            .then(({ output, executionTime }) => {
                setBufferVk(output)



                // Update result based on the outcome
                setGenVkResult(
                    output
                        ? `Vk generation successful. Execution time: ${executionTime} ms`
                        : "Vk generation failed"
                )
            })
            .catch((error) => {
                console.error('An error occurred:', error)
                setWarningGenVk(`Vk generation failed: ${error}`)
            })

        setLoading(false)
    }
    const handleSubmitGenPk = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            vk: formData.get('vk'),
            compiled_onnx: formData.get('compiled_onnx'),
            srs: formData.get('srs'),
        }
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaGenPk.safeParse(formInputs)

        if (warningGenPk) setWarningGenPk('')


        if (!validatedFormInputs.success) {
            setAlertGenPk('Please upload all files')
            return
        }

        // Clear alert and warning
        if (alertGenPk) setAlertGenPk('')

        // Missing data
        if (
            validatedFormInputs.data.vk === null ||
            validatedFormInputs.data.compiled_onnx === null ||
            validatedFormInputs.data.srs === null
        ) {
            setAlertGenPk('Please upload all files')
            return
        }

        setLoading(true)
        console.log("hi")

        // create file object
        const files = {
            vk: validatedFormInputs.data.vk,
            compiled_onnx: validatedFormInputs.data.compiled_onnx,
            srs: validatedFormInputs.data.srs
        }
        /* ================== ENGINE API ====================== */
        utils.handleGenPkButton(files as { [key: string]: File })
            .then(({ output, executionTime }) => {
                setBufferPk(output)
                // Update result based on the outcome
                setGenPkResult(
                    output
                        ? 'Pk generation successful. Execution time: ' + executionTime + ' ms'
                        : 'Pk generation failed'
                )
            })
            .catch((error) => {
                console.error('An error occurred:', error)
                setWarningGenPk(`Pk process failed with an error: ${error}`)
            })

        setLoading(false)
    }


    return (
        <div className='flex flex-col justify-center items-center h-5/6 pb-20'>
            {bufferVk && !warningGenVk ? (
                <div className='w-10/12 flex flex-col'>
                    <h1 className='text-2xl mb-6 '>{genVkResult}</h1>
                    <div className="flex w-full justify-center pt-7">
                        <Button
                            className="w-1/2 mr-3"
                            type='submit'
                            onClick={() => utils.handleFileDownload('test.vk', bufferVk)}
                        >
                            Download Vk File
                        </Button>
                        <Button
                            className="w-1/2"
                            onClick={() => setBufferVk(null)}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            ) : bufferPk && !warningGenPk ? (
                <div className='w-10/12 flex flex-col'>
                    <h1 className='text-2xl mb-6 '>{genPkResult}</h1>
                    <div className="flex w-full justify-center pt-7">
                        <Button
                            className="w-1/2 mr-3"
                            type='submit'
                            onClick={() => utils.handleFileDownload('test.pk', bufferPk)}
                        >
                            Download Pk File
                        </Button>
                        <Button
                            className="w-full"
                            onClick={() => setBufferPk(null)}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            ) : loading ? (
                <Spinner />
            ) : (
                <div className='flex justify-between w-full items-stretch space-x-8'>
                    <GenVkArtifactForm handleSubmit={handleSubmitGenVk} alert={alertGenVk} warning={warningGenVk} />
                    <GenPkArtifactForm handleSubmit={handleSubmitGenPk} alert={alertGenPk} warning={warningGenPk} />
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

function GenVkArtifactForm({
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
            <h1 className='text-2xl mb-6 '>Generate Verifying Key</h1>
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
                    Generate Vk
                </Button>
            </form>
        </div>
    )
}
function GenPkArtifactForm({
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
            <h1 className='text-2xl mb-6 '>Generate Proving Key</h1>
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
                {/* VK */}
                <div>
                    <Label color="white" htmlFor='vk' value='Select VK File' />
                    <FileInput
                        id='vk'
                        name='vk'
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
                    Generate Pk
                </Button>
            </form>
        </div>
    )
}
