import { useState, ChangeEvent } from 'react'
import { handleGenWitnessButton, FileDownload } from '../Utils'

interface GenWitnessProps {
    files: {
        compiled_model: File | null
        input: File | null
    }
    handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function GenWitness({ files, handleFileChange }: GenWitnessProps) {
    const [witnessResult, setWitnessResult] = useState('')
    const [buffer, setBuffer] = useState<Uint8Array | null>(null)
    return (
        <div>
          <h1>Generate Witness</h1>
          <label htmlFor='model_ser_witness'>Compiled Onnx Model:</label>
          <input
            id='model_ser_witness'
            type='file'
            onChange={handleFileChange}
            placeholder='model_ser_witness'
          />
          <label htmlFor='input_witness'>Input:</label>
          <input
            id='input_witness'
            type='file'
            onChange={handleFileChange}
            placeholder='input_witness'
          />
          <button
            id='genWitnessButton'
            onClick={async () => {
              // Set loading state
              setWitnessResult('Loading...')
    
              if (Object.values(files).every((file) => file instanceof File)) {
                handleGenWitnessButton(files as { [key: string]: File })
                  .then(({ output, executionTime }) => {
                    setBuffer(output)
    
                    // Update result based on the outcome
                    setWitnessResult(
                      output
                        ? 'Witness generation successful. Execution time: ' + executionTime + ' ms'
                        : 'Witness generation failed'
                    )
                  })
                  .catch((error) => {
                    console.error('An error occurred:', error)
                    setWitnessResult('Error')
                  })
              }
            }}
            disabled={!Object.values(files).every((file) => file instanceof File)}
          >
            Generate
          </button>
          {buffer && (
            <FileDownload
              fileName='witness.json'
              buffer={buffer}
              handleDownloadCompleted={function (): void {
                setBuffer(null)
              }}
            />
          )}
          <h2>Result:</h2>
          <div>{witnessResult}</div>
        </div>
      )
}
