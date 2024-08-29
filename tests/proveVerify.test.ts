import * as wasmFunctions from '@ezkljs/engine/nodejs'
import { readDataFile } from './utils'
import JSONBig from 'json-bigint'
import { deserialize } from '@ezkljs/engine/nodejs'

describe('Generate witness, prove and verify', () => {
  let proof_ser: Uint8ClampedArray
  let srs_ser: Uint8ClampedArray
  let witness_ser: Uint8ClampedArray
  let input_ser: Uint8ClampedArray
  let compiled_circuit_ser: Uint8ClampedArray

  let proveTime = 0
  let verifyTime = 0

  beforeEach(() => {
    // Initialize the panic hook for readable error messages from WASM
    wasmFunctions.init_panic_hook()
  })

  it('generate witness', async () => {
    // Read in the input and compiled circuit as a Uint8ClampedArray (serialized format)
    input_ser = await readDataFile('input.json', '1l_mlp')
    // Use the deserialize method to convert the non human-readable (but WASM digestable) serialized input from a Uint8ClampedArray to a JSON object
    console.log(
      'input.json',
      JSONBig.stringify(deserialize(input_ser), null, 4),
    )
    // The compiled circuit is bincode serialized, so we can't use the deserialize method on it.
    compiled_circuit_ser = await readDataFile('model.compiled', '1l_mlp')
    // Generate the serialized witness from the input and compiled circuit
    let witness = wasmFunctions.genWitness(compiled_circuit_ser, input_ser)
    // Deserialize the witness from a Uint8ClampedArray to a JSON object
    console.log(
      'witness.json',
      JSONBig.stringify(deserialize(witness), null, 4),
    )
    // We now need to convert the witness from a Uint8Array to Uint8ClampedArray
    // so that it can be ingested by the genWitness binding
    witness_ser = new Uint8ClampedArray(witness.buffer)
  })

  it('prove', async () => {
    wasmFunctions.init_panic_hook()
    // We need to read in the proving key and srs as Uint8ClampedArrays.
    // Both of these artifacts aren't JSON serializable.
    let pk_ser = await readDataFile('pk.key', '1l_mlp')
    srs_ser = await readDataFile('kzg', '1l_mlp')
    // Record the start time for proving
    const startTimeProve = Date.now()
    let proof = wasmFunctions.prove(
      witness_ser,
      pk_ser,
      compiled_circuit_ser,
      srs_ser,
    )
    // Record the end time for proving
    const endTimeProve = Date.now()
    // Convert the returned proof from Uint8Array to Uint8ClampedArray
    // so that it can be ingested by the verify binding
    proof_ser = new Uint8ClampedArray(proof.buffer)
    proveTime = endTimeProve - startTimeProve
    console.log('prove time (ms)', proveTime)
  })

  it('verify', async () => {
    // read in the verification key and settings files as Uint8ClampedArrays
    const vk = await readDataFile('vk.key', '1l_mlp')
    let circuit_settings_ser = await readDataFile('settings.json', '1l_mlp')
    // Deserialize the settings from a Uint8ClampedArray to a JSON object
    console.log(
      'settings.json',
      JSONBig.stringify(deserialize(circuit_settings_ser), null, 4),
    )
    // Record the start time for verifying
    const startTimeVerify = Date.now()
    let proof_ser = await readDataFile('proof.json', '1l_mlp')
    let verification = wasmFunctions.verify(
      proof_ser,
      vk,
      circuit_settings_ser,
      srs_ser,
    )
    // Record the end time for verifying
    const endTimeVerify = Date.now()
    verifyTime = endTimeVerify - startTimeVerify
    console.log('verification time (ms)', verifyTime)
    // Check that the verification is true (i.e. the proof is valid)
    expect(typeof verification).toBe('boolean')
    expect(verification).toBe(true)
  })
})
