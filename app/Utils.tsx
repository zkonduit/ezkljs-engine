import { useEffect, useRef } from 'react'
import {
  prove,
  poseidonHash,
  verify,
  genWitness,
  deserialize,
  genVk,
  genPk,
} from '@ezkljs/engine/web'
import localEVMVerify from '@ezkljs/verify'
import { Hardfork } from '@ezkljs/verify'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import JSONBig from 'json-bigint'

export function readUploadedFileAsBuffer(file: File) {
  return new Promise<Uint8ClampedArray>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target && event.target.result instanceof ArrayBuffer) {
        resolve(new Uint8ClampedArray(event.target.result))
      } else {
        reject(new Error('Failed to read file'))
      }
    }

    reader.onerror = (error) => {
      reject(new Error('File could not be read: ' + error))
    }
    reader.readAsArrayBuffer(file)
  })
}

interface FileDownloadProps {
  fileName: string
  buffer: Uint8Array | null
  handleDownloadCompleted: () => void
}

export function FileDownload({
  fileName,
  buffer,
  handleDownloadCompleted,
}: FileDownloadProps) {
  const linkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    if (!buffer) {
      return
    }

    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    const reader = new FileReader()

    // Convert the Blob to a Data URL
    reader.readAsDataURL(blob)

    reader.onloadend = () => {
      const base64data = reader.result

      // Use the fetch API to download the file
      fetch(base64data as string)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob)

          if (linkRef.current) {
            linkRef.current.href = url
            linkRef.current.download = fileName
            linkRef.current.click()

            // Cleanup
            URL.revokeObjectURL(url)

            // Notify the parent component that the download operation is complete
            handleDownloadCompleted()
          }
        })
    }
  }, [buffer, fileName, handleDownloadCompleted])

  return <a ref={linkRef} style={{ display: 'none' }} />
}

export function handleFileDownload(fileName: string, buffer: Uint8Array) {
  // Create a blob from the buffer
  const blob = new Blob([buffer], { type: 'application/octet-stream' })

  // Create an Object URL from the blob
  const url = window.URL.createObjectURL(blob)

  // Create an anchor element for the download
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)

  // Trigger the download by simulating a click on the anchor element
  a.click()

  // Remove the anchor element after download
  document.body.removeChild(a)

  // Free up the Object URL
  window.URL.revokeObjectURL(url)
}

export function ElgamalZipFileDownload(fileName: string, buffer: Uint8Array) {
  const blob = new Blob([buffer], { type: 'application/octet-stream' })
  const reader = new FileReader()

  reader.onloadend = async () => {
    const base64data = reader.result

    if (typeof base64data === 'string') {
      const elgamalVar = JSONBig.parse(atob(base64data.split(',')[1]))

      // Create a new Zip file
      var zip = new JSZip()
      zip.file('pk.txt', JSONBig.stringify(elgamalVar.pk))
      zip.file('r.txt', JSONBig.stringify(elgamalVar.r))
      zip.file('sk.txt', JSONBig.stringify(elgamalVar.sk))

      // Generate the zip file asynchronously
      const content = await zip.generateAsync({ type: 'blob' })

      saveAs(content, fileName)
    }
  }

  // Convert the Blob to a Data URL
  reader.readAsDataURL(blob)
}

type FileMapping = {
  [key: string]: File
}

type FileSerMapping = {
  [key: string]: Uint8ClampedArray
}

async function convertFilesToFilesSer<T extends FileMapping>(
  files: T,
): Promise<FileSerMapping> {
  const fileReadPromises = Object.entries(files).map(async ([key, file]) => {
    const fileContent = await readUploadedFileAsBuffer(file)
    return { key, fileContent }
  })

  const fileContents = await Promise.all(fileReadPromises)

  const filesSer: FileSerMapping = {}
  for (const { key, fileContent } of fileContents) {
    filesSer[key] = fileContent
  }

  return filesSer
}

interface Uint8ArrayResult {
  output: Uint8Array
  executionTime: number
}

export async function handleGenProofButton<T extends FileMapping>(files: T) {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now() // Start the timer

  let output = prove(
    result['data'],
    result['pk'],
    result['model'],
    result['srs'],
  )

  const end = performance.now() // End the timer

  return {
    output,
    executionTime: end - start,
  }
}
export async function handleGenWitnessButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)
  const start = performance.now() // Start the timer

  let output = genWitness(result['compiled_onnx'], result['input'])

  let witness = deserialize(output)

  console.log(JSON.stringify(witness, null, 2))

  const end = performance.now() // End the timer

  return {
    output: output,
    executionTime: end - start,
  }
}

export async function handleGenVkButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)
  const start = performance.now() // Start the timer

  let output = genVk(result['compiled_onnx'], result['srs'], false)

  const end = performance.now() // End the timer

  return {
    output: output,
    executionTime: end - start,
  }
}

export async function handleGenPkButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)
  const start = performance.now() // Start the timer

  let output = genPk(result['vk'], result['compiled_onnx'], result['srs'])

  const end = performance.now() // End the timer

  return {
    output: output,
    executionTime: end - start,
  }
}

interface HashResult {
  output: Uint8ClampedArray
  executionTime: number
}

export async function handleGenHashButton(message: File): Promise<HashResult> {
  const message_hash = await readUploadedFileAsBuffer(message)
  const start = performance.now() // Start the timer
  const output = poseidonHash(message_hash)
  const end = performance.now() // End the timer
  return {
    output: output,
    executionTime: end - start,
  }
}

interface VerifyResult {
  output: boolean
  executionTime: number
}

export async function handleVerifyButton<T extends FileMapping>(
  files: T,
): Promise<VerifyResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now() // Start the timer

  let output = verify(
    result['proof'],
    result['vk'],
    result['settings'],
    result['srs'],
  )

  const end = performance.now() // End the timer

  return {
    output: output,
    executionTime: end - start,
  }
}

export async function handleEvmVerifyButton<T extends FileMapping>(
  files: T,
  evmVersion: Hardfork,
): Promise<VerifyResult> {
  const result = await convertFilesToFilesSer(files)
  console.log('evmVersion', evmVersion)

  const start = performance.now() // Start the timer

  let output = await localEVMVerify(
    result['proof'],
    new TextDecoder().decode(result['bytecodeVerifier']),
    evmVersion,
  )

  const end = performance.now() // End the timer

  return {
    output: output,
    executionTime: end - start,
  }
}

function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(str)
  return uint8Array
}

function generate256BitSeed(): Uint8ClampedArray {
  const uuid = self.crypto.randomUUID()
  const buffer = stringToUint8Array(uuid)
  let seed = self.crypto.getRandomValues(buffer)
  seed = seed.slice(0, 32)
  return new Uint8ClampedArray(seed.buffer)
}
