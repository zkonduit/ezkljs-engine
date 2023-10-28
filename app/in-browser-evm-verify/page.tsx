
'use client'
import {
    FileInput,
    Label,
    Button,
    Alert,
    Select,
    Spinner as _Spinner,
} from 'flowbite-react'
import React, { useState } from 'react'
import { formDataSchemaEvmVerify } from './parsers'
import { stringify } from "json-bigint";
import { useSharedResources } from '../EngineContext';

enum Hardfork {
    Chainstart = 'chainstart',
    Homestead = 'homestead',
    Dao = 'dao',
    TangerineWhistle = 'tangerineWhistle',
    SpuriousDragon = 'spuriousDragon',
    Byzantium = 'byzantium',
    Constantinople = 'constantinople',
    Petersburg = 'petersburg',
    Istanbul = 'istanbul',
    MuirGlacier = 'muirGlacier',
    Berlin = 'berlin',
    London = 'london',
    ArrowGlacier = 'arrowGlacier',
    GrayGlacier = 'grayGlacier',
    MergeForkIdTransition = 'mergeForkIdTransition',
    Paris = 'paris',
    Shanghai = 'shanghai',
    Cancun = 'cancun',
}

export default function InBrowserEvmVerify() {
    const { engine, utils } = useSharedResources();
    const [alertVerify, setAlertVerify] = useState<string>('')
    const [warningVerify, setWarningVerify] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [evmVerifyResult, setEvmVerifyResult] = useState<string>('');

    const handleSubmitVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            proof: formData.get('proof'),
            bytecode_verifier: formData.get('bytecode_verifier'),
            evm_version: formData.get('evm_version')
        }
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaEvmVerify.safeParse(formInputs)

        if (warningVerify) setWarningVerify('')

        if (!validatedFormInputs.success) {
            setAlertVerify('Please upload all files')
            return
        }

        // Clear alert and warning
        if (alertVerify) setAlertVerify('')
        if (warningVerify) setWarningVerify('')

        // Missing data
        if (
            validatedFormInputs.data.proof === null ||
            validatedFormInputs.data.bytecode_verifier === null ||
            validatedFormInputs.data.evm_version === '' ||
            validatedFormInputs.data.evm_version === null

        ) {
            setAlertVerify('Please upload all files')
            return
        }

        setLoading(true)

        // create file object
        const files = {
            proof: validatedFormInputs.data.proof,
            bytecodeVerifier: validatedFormInputs.data.bytecode_verifier
        }
        /* ================== ENGINE API ====================== */
        utils.handleEvmVerifyButton(files as { [key: string]: File }, validatedFormInputs.data.evm_version as Hardfork)
            .then(({ output, executionTime }) => {
                // Update result based on the outcome
                setEvmVerifyResult(
                    output
                        ? 'Verification successful. Execution time: ' + executionTime + ' ms'
                        : 'Verification failed'
                )
            })
            .catch(error => {
                console.error("An error occurred:", error);
                setEvmVerifyResult("An error occurred: " + error);
            })

        setLoading(false)
    }


    return (
        <div className='flex flex-col justify-center items-center h-5/6 pb-20'>
            {evmVerifyResult && !warningVerify ? (
                <div className='w-10/12 flex flex-col'>
                    <h1 className='text-2xl mb-6 '>{evmVerifyResult}</h1>
                    <div className="flex w-full justify-center">
                        <Button
                            className="w-1/2"
                            onClick={() => setEvmVerifyResult("")}
                        >
                            Go back
                        </Button>
                    </div>
                </div>
            ) : loading ? (
                <Spinner />
            ) : (
                <div className='flex justify-between w-full items-stretch space-x-8'>
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

function VerifyingArtifactForm({
    handleSubmit,
    alert,
    warning
}: {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    alert: string
    warning: string
}) {
    const [EvmVerifyResult, setEvmVerifyResult] = useState('')
    const [selectedVersion, setSelectedVersion] = useState<Hardfork>(Hardfork.Istanbul);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value as Hardfork;
        setSelectedVersion(selectedValue);

    };
    return (
        <div className='flex flex-col' >
            <h1 className='text-2xl mb-6 '>In-Browser Evm Verifying</h1>
            {
                alert && (
                    <Alert color='info' className='mb-6'>
                        {alert}
                    </Alert>
                )
            }
            {
                warning && (
                    <Alert color='warning' className='mb-6'>
                        {warning}
                    </Alert>
                )
            }
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
                {/* VERIFIER BYTECODE */}
                <div>
                    <Label color="white" htmlFor='bytecode_verifier' value='Select Evm Verifier Bytecode' />
                    <FileInput
                        id='bytecode_verifier'
                        name='bytecode_verifier'
                        className='my-4'
                    />
                </div>
                {/* EVM VERSION */}
                <div>
                    <Label color="white" htmlFor='evm_version' value='Select Evm Version' />
                    <Select
                        id='evm_version'
                        name='evm_version'
                        className='my-4'
                        onChange={handleChange}
                        value={selectedVersion}
                    >
                        {Object.keys(Hardfork).map(key => (
                            <option key={key} value={Hardfork[key as keyof typeof Hardfork]}>
                                {key}
                            </option>
                        ))}
                    </Select>

                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'>
                    Verify
                </Button>
            </form>
        </div >
    )
}
