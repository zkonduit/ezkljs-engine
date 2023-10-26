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
import { formDataSchemaEncrypt, formDataSchemaDecrypt } from './parsers'
import { parse, stringify } from "json-bigint";

type Utils = typeof import("../Utils")
type Engine = typeof import("@ezkljs/engine/web/ezkl")

type Cipher = number[][][]
type DecryptedCipher = number[][]

export default function Encryption() {
    const [alertEncrypt, setAlertEncrypt] = useState<string>('')
    const [warningEncrypt, setWarningEncrypt] = useState<string>('')
    const [alertDecrypt, setAlertDecrypt] = useState<string>('')
    const [warningDecrypt, setWarningDecrypt] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [cipherResult, setCipherResult] = useState('')
    const [cipher, setCipher] = useState<Cipher>([] as Cipher)
    const [bufferCipher, setBufferCipher] = useState<Uint8Array | null>(null)
    const [bufferDecrypt, setBufferDecrypt] = useState<Uint8Array | null>(null)
    const [decrypted, setDecrypted] = useState<DecryptedCipher>([] as DecryptedCipher)
    const [utils, setUtils] = useState<Utils>({} as Utils)
    const [engine, setEngine] = useState<Engine>({} as Engine)
    const [decryptResult, setDecryptResult] = useState('');

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

    const handleSubmitEncryption = async (e: React.FormEvent<HTMLFormElement>) => {
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
            r: validatedFormInputs.data.r
        }
        /* ================== ENGINE API ====================== */
        utils.handleGenElgamalEncryptionButton(files as { [key: string]: File })
            .then(({ output, executionTime }) => {
                setBufferCipher(output)



                // Update result based on the outcome
                setCipherResult(
                    output
                        ? `Encryption generation successful. Execution time: ${executionTime} ms`
                        : "Encryption generation failed"
                )
                // Deseralize proof buffer
                // TODO - uncomment this line once a new engine bundle is relased
                // with patch to web based serialize/deserialize methods.
                const cipher = engine.deserialize(output)
                console.log("cipher", cipher)
                setCipher(cipher);
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
            sk: formData.get('elgamal_sk')
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
            sk: validatedFormInputs.data.sk
        }
        /* ================== ENGINE API ====================== */
        utils.handleGenElgamalDecryptionButton(files as { [key: string]: File })
            .then(({ output, executionTime }) => {
                setBufferDecrypt(output)
                // Update result based on the outcome
                setDecryptResult(
                    output
                        ? 'Decryption successful. Execution time: ' + executionTime + ' ms'
                        : 'Decryption failed'
                )
                let decyptedCipher = engine.deserialize(output)
                console.log("decyptedCipher", decyptedCipher)
                setDecrypted(decyptedCipher)
            })
            .catch((error) => {
                console.error('An error occurred:', error)
                setWarningDecrypt(`Decyption process failed with an error: ${error}`)
            })

        setLoading(false)
    }


    return (
        <div className='flex flex-col justify-center items-center h-5/6 pb-20'>
            {bufferCipher && !warningEncrypt ? (
                <div className='w-10/12 flex flex-col'>
                    <h1 className='text-2xl mb-6 '>{cipherResult}</h1>
                    <p className='break-words'>
                        Cipher: {stringify(cipher, null, 6)}
                    </p>
                    <div className="flex w-full justify-center">
                        <Button
                            className="w-1/2 mr-2"
                            type='submit'
                            onClick={() => utils.handleFileDownload('cipher.txt', bufferCipher)}
                        >
                            Download Cipher
                        </Button>
                        <Button
                            className="w-1/2"
                            onClick={() => setBufferCipher(null)}
                        >
                            Go back
                        </Button>
                    </div>
                </div>
            ) : bufferDecrypt && !warningDecrypt ? (
                <div className='w-10/12 flex flex-col'>
                    <h1 className='text-2xl mb-6 '>{decryptResult}</h1>
                    <p className='break-words'>
                        Decrypted Cipher: {stringify(decrypted)}
                    </p>
                    <div className="flex w-full justify-center">
                        <Button
                            className="w-1/2 mr-2"
                            type='submit'
                            onClick={() => utils.handleFileDownload('decrypted.txt', bufferDecrypt)}
                        >
                            Download Decrypted Cipher
                        </Button>
                        <Button
                            className="w-1/2"
                            onClick={() => setBufferDecrypt(null)}
                        >
                            Go back
                        </Button>
                    </div>
                </div>
            ) : loading ? (
                <Spinner />
            ) : (
                <div className='w-full flex flex-col items-stretch'>
                    <div className='w-full'>
                        <ElgamalRandomVar utils={utils} />
                    </div>
                    <div className='flex space-x-8 w-full'>
                        <EncryptionArtifactForm handleSubmit={handleSubmitEncryption} alert={alertEncrypt} warning={warningEncrypt} />
                        <DecryptionArtifactForm handleSubmit={handleSubmitDecrypt} alert={alertDecrypt} warning={warningDecrypt} />
                    </div>
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

function ElgamalRandomVar({ utils }: { utils: Utils }) {
    return (
        <div className='flex flex-col justify-center items-center h-4/6 pb-0'>
            <h1 className='text-2xl mb-3 '>Generate Random Elgamal Variables</h1>
            <Label color="white" htmlFor='elgamal_pk' value='Generates a secure Public Key, Secret Key and Random Seed' />
            <Button
                type='submit'
                color='dark'
                className='w-full self-center mt-4'
                id='genREVButton'
                onClick={() => {
                    const result = utils.handleGenREVButton()
                    utils.ElgamalZipFileDownload("vars.zip", result)
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
    warning
}: {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    alert: string
    warning: string
}) {
    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl mb-6 '>Encrypting</h1>
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
                {/* PK */}
                <div>
                    <Label color="white" htmlFor='elgamal_pk' value='Select Public Key File' />
                    <FileInput
                        id='elgamal_pk'
                        name='elgamal_pk'
                        className='my-4'
                    />
                </div>
                {/* MESSAGE */}
                <div>
                    <Label color="white" htmlFor='elgamal_message' value='Select Message File' />
                    <FileInput
                        id='elgamal_message'
                        name='elgamal_message'
                        className='my-4'
                    />
                </div>
                {/* RANDOM SEED */}
                <div>
                    <Label color="white" htmlFor='elgamal_r' value='Select Random Seed File' />
                    <FileInput
                        id='elgamal_r'
                        name='elgamal_r'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'>
                    Generate Cipher
                </Button>
            </form>
        </div>
    )
}
function DecryptionArtifactForm({
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
            <h1 className='text-2xl mb-6 '>Decrypting</h1>
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
                {/* CIPHER */}
                <div>
                    <Label color="white" htmlFor='cipher' value='Select Cipher File' />
                    <FileInput
                        id='cipher'
                        name='cipher'
                        className='my-4'
                    />
                </div>
                {/* SECRET KEY */}
                <div>
                    <Label color="white" htmlFor='elgamal_sk' value='Select Secret Key File' />
                    <FileInput
                        id='elgamal_sk'
                        name='elgamal_sk'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'>
                    Decrypt Cipher
                </Button>
            </form>
        </div>
    )
}
