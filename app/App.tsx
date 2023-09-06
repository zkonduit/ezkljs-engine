'use client'
import React, { useEffect, useState } from 'react'

import init from '@ezkljs/engine/web/ezkl.js'

import GenWitness from './components/GenWitness'
import ElgamalRandomVar from './components/ElgamalRandomVar'
import ElgamalEncrypt from './components/ElgamalEncrypt'
import ElgamalDecrypt from './components/ElgamalDecrypt'
import GenProof from './components/GenProof'
import Verify from './components/Verify'
import EvmVerify from './components/EvmVerify'
import Hash from './components/Hash'

interface Files {
  [key: string]: File | null
}

export default function Home() {
  const [files, setFiles] = useState<Files>({})

  useEffect(() => {
    async function run() {
      // Initialize the WASM module
      await init(undefined, new WebAssembly.Memory({initial:20,maximum:1024,shared:true}))
    }
    run()
  })


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event.target.id
    const file = event.target.files?.item(0) || null
    setFiles((prevFiles) => ({ ...prevFiles, [id]: file }))
  }

  async function populateWithSampleFiles() {

    const sampleFiles: Files = {};

    // Fetch the elgamal_cipher.txt file
    const cipherResponse = await fetch('/data/elgamal_cipher.txt');
    const cipherBlob: Blob = await cipherResponse.blob();
    sampleFiles['elgamal_cipher'] = new File([cipherBlob], "elgamal_cipher.txt");

    // Fetch the elgamal_sk.txt file
    const skResponse = await fetch('/data/elgamal_var/sk.txt');
    const skBlob: Blob = await skResponse.blob();
    sampleFiles['elgamal_sk'] = new File([skBlob], "elgamal_sk.txt");

    // Fetch the elgamal_pk.txt file
    const pkResponse = await fetch('/data/elgamal_var/pk.txt');
    const pkBlob: Blob = await pkResponse.blob();
    sampleFiles['elgamal_pk'] = new File([pkBlob], "elgamal_pk.txt");

    // Fetch the elgamal_message.txt file
    const messageResponse = await fetch('/data/message.txt');
    const messageBlob: Blob = await messageResponse.blob();
    sampleFiles['elgamal_message'] = new File([messageBlob], "elgamal_message.txt");

    // Fetch the elgamal_r.txt file
    const rResponse = await fetch('/data/elgamal_var/r.txt');
    const rBlob: Blob = await rResponse.blob();
    sampleFiles['elgamal_r'] = new File([rBlob], "elgamal_r.txt");

    // Fetch the data_prove.txt file
    const dataProveResponse = await fetch('/data/test.witness.json');
    const dataProveBlob: Blob = await dataProveResponse.blob();
    sampleFiles['data_prove'] = new File([dataProveBlob], "data_prove.txt");

    // Fetch the pk_prove.txt file
    const pkProveResponse = await fetch('/data/test.provekey');
    const pkProveBlob: Blob = await pkProveResponse.blob();
    sampleFiles['pk_prove'] = new File([pkProveBlob], "pk_prove.txt");

    // Fetch the model_ser_prove.txt file
    const modelSerProveResponse = await fetch('/data/test_network.compiled');
    const modelSerProveBlob: Blob = await modelSerProveResponse.blob();
    sampleFiles['model_ser_prove'] = new File([modelSerProveBlob], "model_ser_prove.txt");

    // Fetch the circuit_settings_ser_prove.txt file
    const circuitSettingsSerProveResponse = await fetch('/data/settings.json');
    const circuitSettingsSerProveBlob: Blob = await circuitSettingsSerProveResponse.blob();
    sampleFiles['circuit_settings_ser_prove'] = new File([circuitSettingsSerProveBlob], "circuit_settings_ser_prove.txt");
    
    // Fetch the srs_ser_prove.txt file
    const srsSerProveResponse = await fetch('/data/kzg');
    const srsSerProveBlob: Blob = await srsSerProveResponse.blob();
    sampleFiles['srs_ser_prove'] = new File([srsSerProveBlob], "srs_ser_prove.txt");

    // Fetch the proof_js.txt file
    const proofJsResponse = await fetch('/data/test.proof');
    const proofJsBlob: Blob = await proofJsResponse.blob();
    sampleFiles['proof_js'] = new File([proofJsBlob], "proof_js.txt");

    // Fetch the vk.txt file
    const vkResponse = await fetch('/data/test.key');
    const vkBlob: Blob = await vkResponse.blob();
    sampleFiles['vk'] = new File([vkBlob], "vk.txt");

    // Fetch the circuit_settings_ser_verify.txt file
    const circuitSettingsSerVerifyResponse = await fetch('/data/settings.json');
    const circuitSettingsSerVerifyBlob: Blob = await circuitSettingsSerVerifyResponse.blob();
    sampleFiles['circuit_settings_ser_verify'] = new File([circuitSettingsSerVerifyBlob], "circuit_settings_ser_verify.txt");

    // Fetch the srs_ser_verify.txt file
    const srsSerVerifyResponse = await fetch('/data/kzg');
    const srsSerVerifyBlob: Blob = await srsSerVerifyResponse.blob();
    sampleFiles['srs_ser_verify'] = new File([srsSerVerifyBlob], "srs_ser_verify.txt");

    // Fetch the message_hash.txt file
    const messageHashResponse = await fetch('/data/message.txt');
    const messageHashBlob: Blob = await messageHashResponse.blob();
    sampleFiles['message_hash'] = new File([messageHashBlob], "message_hash.txt");

    // Fetch the proof_evm.txt file
    const proofEvmResponse = await fetch('/data/test.pf');
    const proofEvmBlob: Blob = await proofEvmResponse.blob();
    sampleFiles['proof_evm'] = new File([proofEvmBlob], "proof_evm.txt");
    
    // Fetch the bytecode_verifier.txt file
    const bytecodeVerifierResponse = await fetch('/data/bytecode.code');
    const bytecodeVerifierBlob: Blob = await bytecodeVerifierResponse.blob();
    sampleFiles['bytecode_verifier'] = new File([bytecodeVerifierBlob], "bytecode_verifier.txt");

    // Fetch the model_ser_witness.txt file
    const modelSerWitnessResponse = await fetch('/data/test_network.compiled');
    const modelSerWitnessBlob: Blob = await modelSerWitnessResponse.blob();
    sampleFiles['model_ser_witness'] = new File([modelSerWitnessBlob], "model_ser_witness.txt");

    // Fetch the input_witness.txt file
    const inputWitnessResponse = await fetch('/data/input.json');
    const inputWitnessBlob: Blob = await inputWitnessResponse.blob();
    sampleFiles['input_witness'] = new File([inputWitnessBlob], "input_witness.txt");

    // Fetch the circuit_settings_ser_witness.txt file
    const circuitSettingsSerWitnessResponse = await fetch('/data/settings.json');
    const circuitSettingsSerWitnessBlob: Blob = await circuitSettingsSerWitnessResponse.blob();
    sampleFiles['circuit_settings_ser_witness'] = new File([circuitSettingsSerWitnessBlob], "circuit_settings_ser_witness.txt");
    setFiles(sampleFiles);
  }
  

  return (
    <div className='App'>
      <button onClick={populateWithSampleFiles}>Populate with sample files</button>

      <GenWitness
        files={{
          compiled_model: files['model_ser_witness'],
          input: files['input_witness'],
          settings: files['circuit_settings_ser_witness'],
        }}
        handleFileChange={handleFileChange}
      />

      <ElgamalRandomVar/>  

      <ElgamalEncrypt
        files={{
          pk: files['elgamal_pk'],
          message: files['elgamal_message'],
          r: files['elgamal_r']
        }}
        handleFileChange={handleFileChange}
      />

      <ElgamalDecrypt
        files={{
          sk: files['elgamal_sk'],
          cipher: files['elgamal_cipher']
        }}
        handleFileChange={handleFileChange}
      />     

      <GenProof
        files={{
          data: files['data_prove'],
          pk: files['pk_prove'],
          model: files['model_ser_prove'],
          circuitSettings: files['circuit_settings_ser_prove'],
          srs: files['srs_ser_prove'],
        }}
        handleFileChange={handleFileChange}
      />

      <Verify
        files={{
          proof: files['proof_js'],
          vk: files['vk'],
          circuitSettings: files['circuit_settings_ser_verify'],
          srs: files['srs_ser_verify'],
        }}
        handleFileChange={handleFileChange}
      />
      <EvmVerify
        files={{
          proof: files['proof_evm'],
          bytecodeVerifier: files['bytecode_verifier']
        }}
        handleFileChange={handleFileChange}
      />

      <Hash
        message={files['message_hash']}
        handleFileChange={handleFileChange}
      />
    </div>
  )
}
