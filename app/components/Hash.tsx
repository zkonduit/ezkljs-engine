import { useState, ChangeEvent } from 'react'
import { handleGenHashButton, FileDownload } from '../Utils'

interface HashProps {
  message: File | null
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function Hash({ message, handleFileChange }: HashProps) {
  const [buffer, setBuffer] = useState<Uint8ClampedArray | null>(null)
  const [hashResult, setHashResult] = useState<string | null>(null)

  return (
    <div>
      <h1>Generate Hash</h1>
      <label htmlFor='message_hash'>Message:</label>
      <input
        id='message_hash'
        type='file'
        onChange={handleFileChange}
        placeholder='Message'
      />
      <button
        id='genHashButton'
        onClick={async () => {
          // Set loading state
          setHashResult('Loading...')
          handleGenHashButton(message as File)
            .then(({output, executionTime}) => {
              setBuffer(output)

              // Update result based on the outcome
              setHashResult(
                output
                  ? 'Hash generation successful. Execution time: ' + executionTime + ' ms'
                  : 'Hash generation failed'
              )
            })
            .catch(error => {
              console.error("An error occurred:", error);
              setHashResult("An error occurred: " + error);
            })
        }}
        disabled={!message}
      >
        Generate
      </button>
      {buffer && (
        <FileDownload
          fileName='hash.txt'
          buffer={new Uint8Array(buffer.buffer)}
          handleDownloadCompleted={function (): void {
            setBuffer(null)
          }}
        />
      )}
      <h2>Result:</h2>
      <div>{hashResult}</div>
    </div>
  )
}
