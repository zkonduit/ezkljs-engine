import { useEffect, useRef } from 'react'
import { 
  elgamalGenRandom,
  elgamalEncrypt,
  elgamalDecrypt,
  prove, 
  poseidonHash, 
  verify,
  vecU64ToFelt 
} from '@ezkljs/engine/web'
import localEVMVerify, { Hardfork } from '@ezkljs/verify'
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

export function ElgamalZipFileDownload({
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
        const content = await zip.generateAsync({type:"blob"})
        
        saveAs(content, fileName)

        // Notify the parent component that the download operation is complete
        handleDownloadCompleted()
      }
    }

    // Convert the Blob to a Data URL
    reader.readAsDataURL(blob)
  }, [buffer, fileName, handleDownloadCompleted])

  return <a ref={linkRef} style={{ display: 'none' }} />
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
  output: Uint8Array;
  executionTime: number;
}

export async function handleGenProofButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now();  // Start the timer

  let output = prove(
    result['data'],
    result['pk'],
    result['model'],
    result['circuitSettings'],
    result['srs'],
  )
  
  const end = performance.now();  // End the timer

  return {
    output: output,
    executionTime: end - start
  }
}

export function handleGenREVButton(): Uint8Array {
  const seed = generate256BitSeed()
  return elgamalGenRandom(seed)
}

export async function handleGenElgamalEncryptionButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now();  // Start the timer

  let output = elgamalEncrypt(
    result['pk'],
    result['message'],
    result['r']
  )

  const end = performance.now();  // End the timer

  return {
    output: output,
    executionTime: end - start
  }
}

export async function handleGenElgamalDecryptionButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)
  const start = performance.now();  // Start the timer

  let output = elgamalDecrypt(
    result['cipher'],
    result['sk']
  )

  const end = performance.now();  // End the timer

  return {
    output: output,
    executionTime: end - start
  }
}

interface HashResult {
  output: Uint8ClampedArray;
  executionTime: number;
}


export async function handleGenHashButton(message: File): Promise<HashResult> {
  const message_hash = await readUploadedFileAsBuffer(message)
  const start = performance.now();  // Start the timer
  const output =  poseidonHash(message_hash)
  const end = performance.now();  // End the timer
  return {
    output: output,
    executionTime: end - start
  }
}

interface VerifyResult {
  output: boolean;
  executionTime: number;
}

export async function handleVerifyButton<T extends FileMapping>(
  files: T,
): Promise<VerifyResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now();  // Start the timer

  let output = verify(
    result['proof'],
    result['vk'],
    result['circuitSettings'],
    result['srs'],
  )

  const end = performance.now();  // End the timer

  return {
    output: output,
    executionTime: end - start
  }
}

interface Snark {
  instances: Array<Array<Array<string>>>
  proof: Uint8Array
}

function vecu64ToField(b: string[]): string {
  if (b.length !== 4) {
    throw new Error('Input should be an array of 4 big integers.')
  }

  let result = BigInt(0)
  for (let i = 0; i < 4; i++) {
    // Note the conversion to BigInt for the shift operation
    result += BigInt(b[i]!) << (BigInt(i) * BigInt(64))
  }
  return result.toString()
}

function byteToHex(byte: number) {
  // convert the possibly signed byte (-128 to 127) to an unsigned byte (0 to 255).
  // if you know, that you only deal with unsigned bytes (Uint8Array), you can omit this line
  const unsignedByte = byte & 0xff;

  // If the number can be represented with only 4 bits (0-15), 
  // the hexadecimal representation of this number is only one char (0-9, a-f). 
  if (unsignedByte < 16) {
    return '0' + unsignedByte.toString(16);
  } else {
    return unsignedByte.toString(16);
  }
}

// bytes is an typed array (Int8Array or Uint8Array)
function toHexString(bytes: Uint8Array | Int8Array): string {
  // Since the .map() method is not available for typed arrays, 
  // we will convert the typed array to an array using Array.from().
  return Array.from(bytes)
    .map(byte => byteToHex(byte))
    .join('');
}

function parseProof(proofBuffer: Uint8ClampedArray): [string[], string] {
  let proofFileContent: string = new TextDecoder().decode(proofBuffer);
  // Parse it into Snark object using JSONBig
  const proof: Snark = JSONBig.parse(proofFileContent)
  console.log(proof.instances)
  // Parse instances to public inputs
  const instances: string[][] = []

  for (const val of proof.instances) {
    const inner_array: string[] = []
    for (const inner of val) {
      const u64sString = JSONBig.stringify(inner);
      console.log('u64String', u64sString);
      const u64sSer = new TextEncoder().encode(u64sString);
      const u64sSerClamped = new Uint8ClampedArray(u64sSer.buffer);
      let hexFieldElement = vecU64ToFelt(u64sSerClamped)
      inner_array.push(hexFieldElement)
    }
    instances.push(inner_array)
  }

  const publicInputs = instances.flat()
  const proofString = toHexString(proof.proof)
  return [publicInputs, '0x' + proofString]
}


export async function handleEvmVerifyButton<T extends FileMapping>(
  files: T,
  evmVersion: Hardfork
): Promise<VerifyResult> {
  const result = await convertFilesToFilesSer(files)
  console.log("evmVersion", evmVersion)
  // Parse proof file into public inputs and proof (the types the evm verifier expects)
  let [pubInputs, proof] = parseProof(result['proof']) 

  const start = performance.now();  // Start the timer

  let output = await localEVMVerify(
    proof,
    pubInputs,
    new TextDecoder().decode(result['bytecodeVerifier']),
    evmVersion
  )

  const end = performance.now();  // End the timer

  return {
    output: output,
    executionTime: end - start
  }
}

function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder(); 
  const uint8Array = encoder.encode(str);
  return uint8Array;
}

function generate256BitSeed(): Uint8ClampedArray {
  const uuid = self.crypto.randomUUID();
  const buffer = stringToUint8Array(uuid);
  let seed = self.crypto.getRandomValues(buffer);
  seed = seed.slice(0, 32);
  return new Uint8ClampedArray(seed.buffer);
}
