import { useState, ChangeEvent } from 'react'
import { handleGenElgamalDecryptionButton, FileDownload } from '../Utils'

interface ElgamalDecryptionProps {
  files: {
    cipher: File | null,
    sk: File | null
  }
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function ElgamalDecryption({ files, handleFileChange }: ElgamalDecryptionProps) {
  const [buffer, setBuffer] = useState<Uint8Array | null>(null)
  const [decryptionResult, setDecryptionResult] = useState<string | null>(null)

  return (
    <div>
      <h1>Generate Elgamal Decryption</h1>
      <label htmlFor='elgamal_cipher'>Cipher:</label>
      <input
        id='elgamal_cipher'
        type='file'
        onChange={handleFileChange}
        placeholder='elgamal_cipher'
      />
      <label htmlFor='elgamal_sk'>Secret Key:</label>
      <input
        id='elgamal_sk'
        type='file'
        onChange={handleFileChange}
        placeholder='elgamal_sk'
      />
      <button
        id='genDecryptionButton'
        onClick={async () => {
          // Set loading state
          setDecryptionResult('Loading...')

          if (Object.values(files).every((file) => file instanceof File)) {
            handleGenElgamalDecryptionButton(files as { [key: string]: File })
              .then(({ output, executionTime }) => {
                setBuffer(output)

                // Update result based on the outcome
                setDecryptionResult(
                  output
                    ? 'Decryption successful. Execution time: ' + executionTime + ' ms'
                    : 'Decryption failed'
                )
              })
              .catch(error => {
                console.error("An error occurred:", error);
                setDecryptionResult("An error occurred: " + error);
              })
          }
        }}
        disabled={!Object.values(files).every((file) => file instanceof File)}
      >
        Generate
      </button>
      {buffer && (
        <FileDownload
          fileName='decrypted_cipher.txt'
          buffer={buffer}
          handleDownloadCompleted={function (): void {
            setBuffer(null)
          }}
        />
      )}
      <h2>Result:</h2>
      <div>{decryptionResult}</div>
    </div>
  )
}
