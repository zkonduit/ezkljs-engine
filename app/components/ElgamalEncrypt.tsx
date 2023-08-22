import { useState, ChangeEvent } from 'react'
import { handleGenElgamalEncryptionButton, FileDownload } from '../Utils'

interface ElgamalEncryptionProps {
  files: {
    pk: File | null,
    message: File | null,
    r: File | null
  }
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function ElgamalEncryption({ files, handleFileChange }: ElgamalEncryptionProps) {
  const [buffer, setBuffer] = useState<Uint8Array | null>(null)
  const [encryptionResult, setEncryptionResult] = useState<string | null>(null)

  return (
    <div>
      <h1>Generate Elgamal Encryption</h1>
      <label htmlFor='elgamal_pk'>Public Key:</label>
      <input
        id='elgamal_pk'
        type='file'
        onChange={handleFileChange}
        placeholder='elgamal_pk'
      />
      <label htmlFor='elgamal_message'>Message:</label>
      <input
        id='elgamal_message'
        type='file'
        onChange={handleFileChange}
        placeholder='elgamal_message'
      />
      <label htmlFor='elgamal_r'>Encryption Randomness:</label>
      <input
        id='elgamal_r'
        type='file'
        onChange={handleFileChange}
        placeholder='elgamal_r'
      />
      <button
        id='genElgamalEncryptionButton'
        onClick={async () => {
          // Set loading state
          setEncryptionResult("Loading...");

          if (Object.values(files).every((file) => file instanceof File)) {
            handleGenElgamalEncryptionButton(files as { [key: string]: File })
              .then(({ output, executionTime }) => {
                setBuffer(output);

                // Update result based on the outcome
                setEncryptionResult(
                  output
                    ? 'Cipher generation successful. Execution time: ' + executionTime + ' ms'
                    : 'Cipher generation failed'
                );
              })
              .catch(error => {
                console.error("An error occurred:", error);
                setEncryptionResult("Error");
              });
          }
        }}
        disabled={!Object.values(files).every((file) => file instanceof File)}
      >
        Generate
      </button>
      {buffer && (
        <FileDownload
          fileName='cipher.txt'
          buffer={buffer}
          handleDownloadCompleted={function (): void {
            setBuffer(null)
          }}
        />
      )}
      <h2>Result:</h2>
      <div>{encryptionResult}</div>
    </div>
  )
}
