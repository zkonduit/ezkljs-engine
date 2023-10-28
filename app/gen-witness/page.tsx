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

export default function GenWitness() {
    const { engine, utils } = useSharedResources();
    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };
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
            input: formData.get('input')
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
            input: validatedFormInputs.data.input
        }

        setLoading(true)

        /* ================== ENGINE API ====================== */
        utils.handleGenWitnessButton(files as { [key: string]: File })
            .then(({ output, executionTime }) => {
                setBuffer(output)

                // Update result based on the outcome
                setWitnessResult(
                    output
                        ? `Witness generation successful. Execution time: ${executionTime} ms`
                        : "Witness generation failed"
                )
                const witness = engine.deserialize(output)
                console.log("witness", witness)
                setWitness(witness);
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
                    <h1 className='text-2xl mb-6 '>{witnessResult}</h1>

                    <div className="flex w-full justify-center pt-5">
                        <Button
                            className="w-1/2 mr-3"
                            type='submit'
                            onClick={() => utils.handleFileDownload('witness.json', buffer)}
                        >
                            Download Witness
                        </Button>
                        <Button
                            className="w-1/2 mr-3"
                            onClick={() => props.setOpenModal('default')}
                            data-modal-target="witness-modal"
                            data-modal-toggle="witness-modal"
                        >
                            Show Witness
                        </Button>
                        <Button
                            className="w-1/2"
                            onClick={() => setBuffer(null)}
                        >
                            Reset
                        </Button>
                        <Modal show={props.openModal === 'default'} onClose={() => props.setOpenModal(undefined)} >
                            <Modal.Header>Witness File Content: </Modal.Header>
                            <Modal.Body className="bg-black">
                                <div className='mt-4 p-4 bg-black-100 rounded border'>
                                    <pre className='blackspace-pre-wrap'>{stringify(witness, null, 6)}</pre>
                                </div>
                            </Modal.Body>
                        </Modal>
                    </div>
                </div>

            ) : loading ? (
                <Spinner />
            ) : (
                <WitnessArtifactForm handleSubmit={handleSubmit} alert={alert} warning={warning} />
            )
            }
        </div >
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

function WitnessArtifactForm({
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
                className='flex flex-col flex-grow  justify-between'
            >
                {/* COMPILED ONNX */}
                <div>
                    <Label color="white" htmlFor='compiled_onnx' value='Select Compiled Onnx File' />
                    <FileInput
                        id='compiled_onnx'
                        name='compiled_onnx'
                        className='my-4'
                    />
                </div>
                {/* INPUT */}
                <div>
                    <Label color="white" htmlFor='input' value='Select Input File' />
                    <FileInput
                        id='input'
                        name='input'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'>
                    Generate Witness
                </Button>
            </form>
        </div>
    )
}

// const Modal = ({ isOpen, onClose, witness }: { isOpen: boolean, onClose: () => void, witness: object }) => {
//     if (!isOpen) return null;

//     return (
//         <div id="witness-modal" aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
//             <div className="relative w-full max-w-2xl max-h-full">
//                 {/* <!-- Modal content --> */}
//                 <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//                     {/* <!-- Modal header --> */}
//                     <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
//                         <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                             Witness Information
//                         </h3>
//                         <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="witness-modal">
//                             <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
//                                 <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
//                             </svg>
//                             <span className="sr-only">Close modal</span>
//                         </button>
//                     </div>
//                     {/* <!-- Modal body --> */}
//                     <div className="p-6 space-y-6">
//                         <div className='mt-4 p-4 bg-black-100 rounded border'>
//                             <pre className='whitespace-pre-wrap'>{stringify(witness, null, 6)}</pre>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

