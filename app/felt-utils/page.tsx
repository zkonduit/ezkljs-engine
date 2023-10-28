// Example for pages/Page1.js
'use client'
import {
    TextInput,
    Label,
    Button,
    Alert,
    Spinner as _Spinner,
} from 'flowbite-react'
import React, { useState } from 'react'
import { formDataSchemaFloatToVecU64, formDataSchemaVecU64ToInt, formDataSchemaVecU64ToFloat, formDataSchemaVecU64ToFelt } from './parsers'
import { useSharedResources } from '../EngineContext';
import { stringify } from "json-bigint";

type Utils = typeof import("../Utils")
type Engine = typeof import("@ezkljs/engine/web/ezkl")

type Cipher = number[][][]
type DecryptedCipher = number[][]

export default function FeltUtils() {
    const { engine } = useSharedResources();

    return (
        <div className='flex flex-wrap h-screen pt-10 pb-20'>
            <div className='flex flex-col w-1/2 h-1/2 justify-center items-center p-4'>
                <div className='w-full h-full overflow-auto'>
                    <FloatToVecU64Form engine={engine} />
                </div>
            </div>
            <div className='flex flex-col w-1/2 h-1/2 justify-center items-center p-4'>
                <div className='w-full h-full overflow-auto'>
                    <VecU64ToFloatForm engine={engine} />
                </div>
            </div>
            <div className='flex flex-col w-1/2 h-1/2 justify-center items-center p-4'>
                <div className='w-full h-full overflow-auto'>
                    <VecU64ToIntForm engine={engine} />
                </div>
            </div>
            <div className='flex flex-col w-1/2 h-1/2 justify-center items-center p-4'>
                <div className='w-full h-full overflow-auto'>
                    <VecU64ToFeltForm engine={engine} />
                </div>
            </div>
        </div>
    );
}

function FloatToVecU64Form({
    engine
}: {
    engine: Engine
}) {
    const [alertFloatToVecU64, setAlertFloatToVecU64] = useState<string>('')
    const [warningFloatToVecU64, setWarningFloatToVecU64] = useState<string>('')
    const [output, setOutput] = useState<string>('')

    const handleSubmitFloatToVecU64 = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            fp: formData.get('fp')?.toString(),
            scale: formData.get('scale')?.toString()
        }

        // Missing data
        if (
            formInputs.fp === '' ||
            formInputs.scale === ''
        ) {
            setAlertFloatToVecU64("Please enter a value in all fields")
            return
        }
        console.log("formInputs", formInputs)
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaFloatToVecU64.safeParse(formInputs)

        if (warningFloatToVecU64) setWarningFloatToVecU64('')

        if (!validatedFormInputs.success) {
            let alertString = ''
            validatedFormInputs.error.issues.map((issue) => {
                console.log("issue", issue)
                alertString += issue.message + '\n'
            })
            setAlertFloatToVecU64(alertString)
            return
        }

        // Clear alert and warning
        if (alertFloatToVecU64) setAlertFloatToVecU64('')
        setWarningFloatToVecU64('')
        // Missing
        if (
            validatedFormInputs.data.fp === null ||
            validatedFormInputs.data.scale === null
        ) {
            setAlertFloatToVecU64('Please upload all files')
            return
        }

        // create file object
        const entries = {
            fp: validatedFormInputs.data.fp,
            scale: validatedFormInputs.data.scale
        }

        console.log("entries", entries)
        /* ================== ENGINE API ====================== */
        try {
            const U64s = engine.floatToVecU64(parseFloat(entries.fp), entries.scale);
            const deserializedU64s = engine.deserialize(U64s)
            setOutput(stringify(deserializedU64s, null, 4))
            console.log("U64s", deserializedU64s)
        } catch (error) {
            console.error('An error occurred:', error)
            setWarningFloatToVecU64(`Float to VecU64 generation failed: ${error}`)
        }
    }

    return (
        <div className=''>
            <h1 className='text-2xl mb-6 '>Float {"->"} VecU64</h1>
            {alertFloatToVecU64 && (
                <Alert color='info' className='mb-6'>
                    {alertFloatToVecU64}
                </Alert>
            )}
            {warningFloatToVecU64 && (
                <Alert color='warning' className='mb-6'>
                    {warningFloatToVecU64}
                </Alert>
            )}
            <form
                onSubmit={handleSubmitFloatToVecU64}
                className='flex flex-col flex-grow justify-between'
            >
                {/* FLOATING POINT */}
                <div>
                    <Label color="white" htmlFor='fp' value='Floating Point' />
                    <TextInput
                        type='test'
                        id='fp'
                        name='fp'
                        className='my-4'
                    />
                </div>
                {/* SCALE */}
                <div>
                    <Label color="white" htmlFor='scale' value='Scale' />
                    <TextInput
                        type='number'
                        id='scale'
                        name='scale'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'
                >
                    Generate VecU64
                </Button>
            </form>
            {/* Output section */}
            {output && (
                <div className='mt-4 p-4 bg-black-100 rounded border'>
                    <pre className='whitespace-pre-wrap'>{output}</pre>
                </div>
            )}
        </div>
    )
}

function VecU64ToFloatForm({
    engine
}: {
    engine: Engine
}) {
    const [alert, setAlert] = useState<string>('')
    const [warning, setWarning] = useState<string>('')
    const [output, setOutput] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            vecU64: formData.get('vecU64')?.toString(),
            scale: formData.get('scale')?.toString()
        }
        console.log("formInputs", formInputs)

        // Missing data
        if (
            formInputs.vecU64 === '' ||
            formInputs.scale === ''
        ) {
            setAlert("Please enter a value in all fields")
            return
        }
        console.log("formInputs", formInputs)
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaVecU64ToFloat.safeParse(formInputs)

        if (warning) setWarning('')

        if (!validatedFormInputs.success) {
            let alertString = ''
            validatedFormInputs.error.issues.map((issue) => {
                console.log("issue", issue)
                alertString += issue.message + '\n'
            })
            setAlert(alertString)
            return
        }

        // Clear alert and warning
        if (alert) setAlert('')
        setWarning('')
        // Missing
        if (
            validatedFormInputs.data.vecU64 === null ||
            validatedFormInputs.data.scale === null
        ) {
            setAlert('Please upload all files')
            return
        }

        // create file object
        const entries = {
            vecU64: validatedFormInputs.data.vecU64,
            scale: validatedFormInputs.data.scale
        }

        console.log("entries", entries)
        /* ================== ENGINE API ====================== */
        try {

            const float = engine.vecU64ToFloat(engine.serialize(entries.vecU64), entries.scale);
            setOutput(stringify(float, null, 4))
            console.log("float", float)
        } catch (error) {
            console.error('An error occurred:', error)
            setWarning(`VecU64 to Float generation failed: ${error}`)
        }
    }

    return (
        <div className=''>
            <h1 className='text-2xl mb-6 '>VecU64 {"->"} Float</h1>
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
                {/* vecU64 */}
                <div>
                    <Label color="white" htmlFor='vecU64' value='Length 4 vecU64' />
                    <TextInput
                        type='text'
                        id='vecU64'
                        name='vecU64'
                        className='my-4'
                    />
                </div>
                {/* SCALE */}
                <div>
                    <Label color="white" htmlFor='scale' value='Scale' />
                    <TextInput
                        type='number'
                        id='scale'
                        name='scale'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'
                >
                    Generate Floating Point
                </Button>
            </form>
            {/* Output section */}
            {output && (
                <div className='mt-4 p-4 bg-black-100 rounded border'>
                    <pre className='whitespace-pre-wrap'>{output}</pre>
                </div>
            )}
        </div>
    )
}

function VecU64ToIntForm({
    engine
}: {
    engine: Engine
}) {
    const [alert, setAlert] = useState<string>('')
    const [warning, setWarning] = useState<string>('')
    const [output, setOutput] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            vecU64: formData.get('vecU64')?.toString()
        }

        // Missing data
        if (
            formInputs.vecU64 === ''
        ) {
            setAlert("Please enter a value in all fields")
            return
        }
        console.log("formInputs", formInputs)
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaVecU64ToInt.safeParse(formInputs)

        if (warning) setWarning('')

        if (!validatedFormInputs.success) {
            let alertString = ''
            validatedFormInputs.error.issues.map((issue) => {
                console.log("issue", issue)
                alertString += issue.message + '\n'
            })
            setAlert(alertString)
            return
        }

        // Clear alert and warning
        if (alert) setAlert('')
        setWarning('')
        // Missing
        if (
            validatedFormInputs.data.vecU64 === null
        ) {
            setAlert('Please upload all files')
            return
        }

        // create file object
        const entries = {
            vecU64: validatedFormInputs.data.vecU64
        }

        console.log("entries", entries)
        /* ================== ENGINE API ====================== */
        try {
            const int = engine.vecU64ToInt(engine.serialize(entries.vecU64));
            const intDeserialized = engine.deserialize(int)
            setOutput(intDeserialized)
            console.log("int", int)
        } catch (error) {
            console.error('An error occurred:', error)
            setWarning(`VecU64 to Int generation failed: ${error}`)
        }
    }

    return (
        <div className=''>
            <h1 className='text-2xl mb-6 '>VecU64 {"->"} Int</h1>
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
                {/* vecU64 */}
                <div>
                    <Label color="white" htmlFor='vecU64' value='Length 4 vecU64' />
                    <TextInput
                        type='text'
                        id='vecU64'
                        name='vecU64'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'
                >
                    Generate Integer
                </Button>
            </form>
            {/* Output section */}
            {output && (
                <div className='mt-4 p-4 bg-black-100 rounded border'>
                    <pre className='whitespace-pre-wrap'>{output}</pre>
                </div>
            )}
        </div>
    )
}

function VecU64ToFeltForm({
    engine
}: {
    engine: Engine
}) {
    const [alert, setAlert] = useState<string>('')
    const [warning, setWarning] = useState<string>('')
    const [output, setOutput] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const formInputs = {
            vecU64: formData.get('vecU64')?.toString()
        }

        // Missing data
        if (
            formInputs.vecU64 === ''
        ) {
            setAlert("Please enter a value in all fields")
            return
        }
        console.log("formInputs", formInputs)
        // Validate form has valid inputs (zod)
        const validatedFormInputs = formDataSchemaVecU64ToFelt.safeParse(formInputs)

        if (warning) setWarning('')

        if (!validatedFormInputs.success) {
            let alertString = ''
            validatedFormInputs.error.issues.map((issue) => {
                console.log("issue", issue)
                alertString += issue.message + '\n'
            })
            setAlert(alertString)
            return
        }

        // Clear alert and warning
        if (alert) setAlert('')
        setWarning('')
        // Missing
        if (
            validatedFormInputs.data.vecU64 === null
        ) {
            setAlert('Please upload all files')
            return
        }

        // create file object
        const entries = {
            vecU64: validatedFormInputs.data.vecU64
        }

        console.log("entries", entries)
        /* ================== ENGINE API ====================== */
        try {
            const hexFelt = engine.vecU64ToFelt(engine.serialize(entries.vecU64));
            setOutput(hexFelt)
            console.log("felt", hexFelt)
        } catch (error) {
            console.error('An error occurred:', error)
            setWarning(`VecU64 to Felt generation failed: ${error}`)
        }
    }
    const formatOutput = (output: string) => {
        const len = output.length;
        const partLen = Math.ceil(len / 4);
        const formattedOutput = [
            output.substring(0, partLen),
            output.substring(partLen, partLen * 2),
            output.substring(partLen * 2, partLen * 3),
            output.substring(partLen * 3),
        ].join('\n');
        return formattedOutput;
    };

    return (
        <div className=''>
            <h1 className='text-2xl mb-6 '>VecU64 {"->"} Felt</h1>
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
                {/* vecU64 */}
                <div>
                    <Label color="white" htmlFor='vecU64' value='Length 4 vecU64' />
                    <TextInput
                        type='text'
                        id='vecU64'
                        name='vecU64'
                        className='my-4'
                    />
                </div>
                <Button type='submit' color='dark' className='w-full self-center mt-4'
                >
                    Generate Field Element
                </Button>
            </form>
            {/* Output section */}
            {output && (
                <div className='mt-4 p-4 bg-black-100 rounded border'>
                    <pre className='whitespace-pre-wrap'>{formatOutput(output)}</pre>
                </div>
            )}
        </div>
    )
}