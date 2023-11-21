import * as wasmFunctions from '@ezkljs/engine/nodejs'
import { readDataFile } from './utils'
import JSONBig from 'json-bigint'

describe('Elgamal Encryption', () => {
  let message_ser = Uint8ClampedArray

  let elgamalVariables: {
    pk: BigInt[][]
    sk: BigInt[]
    r: BigInt[]
  }

  let cipherText: bigint[][][]

  it('elgamalGenRandom ', async () => {
    // Create a new random buffer of length 32
    // to be submitted as a seed value to
    // the elgamalGenRandom binding
    // IN PRODUCTION USE A CRYPTOGRAPHICALLY SECURE RNG,
    // NOT MATH.RANDOM. Only used here for testing purposes.
    const length = 32
    let uint8Array = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      uint8Array[i] =
        (Math.floor(Math.random() * Math.pow(2, 8)) >>> (i * 8)) & 0xff
    }
    const rng_buffer = new Uint8ClampedArray(uint8Array.buffer)
    const elgamalVariables_ser = wasmFunctions.elgamalGenRandom(rng_buffer)
    // Deserialize the result from a Uint8ClampedArray to a JSON object
    elgamalVariables = wasmFunctions.deserialize(elgamalVariables_ser)
    console.log(
      'Elgamal variables',
      JSONBig.stringify(elgamalVariables, null, 4),
    )
  })

  it('elgamalEncrypt', async () => {
    const message_ser = await readDataFile('message.txt', '1l_mlp')
    const pk_ser = wasmFunctions.serialize(elgamalVariables.pk)
    const r_ser = wasmFunctions.serialize(elgamalVariables.r)
    const cipherText_ser = wasmFunctions.elgamalEncrypt(
      pk_ser,
      message_ser,
      r_ser,
    )
    cipherText = wasmFunctions.deserialize(cipherText_ser)
    console.log('Elgamal cipher text', JSONBig.stringify(cipherText, null, 4))
  })

  it('elgamalDecrypt', async () => {
    const cipherText_ser = wasmFunctions.serialize(cipherText)
    const sk_ser = wasmFunctions.serialize(elgamalVariables.sk)
    const message_ser = wasmFunctions.elgamalDecrypt(cipherText_ser, sk_ser)
    const message = wasmFunctions.deserialize(message_ser)
    console.log(
      'Elgamal decrypted message',
      JSONBig.stringify(message, null, 4),
    )
    let message_ser_original = await readDataFile('message.txt', '1l_mlp')
    let originalMessage = wasmFunctions.deserialize(message_ser_original)
    console.log('Original message', originalMessage)
    expect(message).toEqual(originalMessage)
  })
})
