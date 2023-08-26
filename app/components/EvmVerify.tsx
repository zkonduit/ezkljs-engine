import { useState, ChangeEvent } from 'react'
import { handleEvmVerifyButton } from '../Utils'
import { Hardfork } from '@ezkljs/verify'

interface EvmVerifyProps {
    files: {
        proof: File | null,
        bytecodeVerifier: File | null
    }
    handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function EvmVerify({ files, handleFileChange }: EvmVerifyProps) {
    const [EvmVerifyResult, setEvmVerifyResult] = useState('')
    const [selectedVersion, setSelectedVersion] = useState<Hardfork>(Hardfork.Istanbul);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value as Hardfork;
      setSelectedVersion(selectedValue);

    };

    return (
        <div>
            <h1>Evm Verify</h1>
            <label htmlFor='proof_evm'>Proof:</label>
            <input
                id='proof_evm'
                type='file'
                onChange={handleFileChange}
                placeholder='proof_evm'
            />
            <label htmlFor='bytecode_verifier'>Verifier Bytecode:</label>
            <input
                id='bytecode_verifier'
                type='file'
                onChange={handleFileChange}
                placeholder='bytecode_verifier'
            />
            <label htmlFor="evm-version">EVM version: </label>
            <select id="evm-version" value={selectedVersion} onChange={handleChange}>
                {Object.values(Hardfork).map((value) => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </select>
            <button
                id='evmVerifyButton'
                onClick={async () => {
                    // Set loading state
                    setEvmVerifyResult('Loading...')
                    if (Object.values(files).every((file) => file instanceof File)) {
                        handleEvmVerifyButton(files as { [key: string]: File }, selectedVersion)
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
                    }
                }}
                disabled={!Object.values(files).every((file) => file instanceof File)}
            >
                Verify
            </button>
            <h2>Result:</h2>
            <div>{EvmVerifyResult}</div>
        </div>
    )
}
