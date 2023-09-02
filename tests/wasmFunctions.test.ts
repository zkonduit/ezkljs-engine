import * as wasmFunctions from '@ezkljs/engine/nodejs';
import { 
    uint8ArrayToJsonObject,
    readDataFile,
    deserialize,
    serialize,
    intToFieldElement,
    randomZScore
 } from './utils';

describe('wasmFunctions', () => {
    

    describe('poseidonHash', () => {
        it('should return a Uint8Array', async () => {
          const message = await readDataFile('message.txt');
          const result = wasmFunctions.poseidonHash(message);
          expect(result).toBeInstanceOf(Uint8ClampedArray);
        });
      });
    
    describe('Elgamal Encryption', () => {

        let message_ser = Uint8ClampedArray;

        let elgamalVariables: {
            pk: BigInt[][],
            sk: BigInt[],
            r: BigInt[]
        };

        let cipherText: bigint[][][]

        it('elgamalGenRandom ', async () => {
            const length = 32;
            let uint8Array = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
              uint8Array[i] = (Math.floor(Math.random() * Math.pow(2, 8)) >>> (i * 8)) & 0xFF;
            }
            const rng_buffer = new Uint8ClampedArray(uint8Array.buffer);
            const result = wasmFunctions.elgamalGenRandom(rng_buffer);
            elgamalVariables = uint8ArrayToJsonObject(result)
            console.log("Elgamal variables", elgamalVariables);
            expect(result).toBeInstanceOf(Uint8Array);
        });

        it('elgamalEncrypt', async () => {
            const message_ser = await readDataFile('message.txt');
            const pk = serialize(elgamalVariables.pk);
            const r = serialize(elgamalVariables.r);
            const result = wasmFunctions.elgamalEncrypt(pk, message_ser, r);
            cipherText = uint8ArrayToJsonObject(result)
            console.log("Elgamal cipher text", cipherText)
            expect(result).toBeInstanceOf(Uint8Array);
        });

        it('elgamalDecrypt', async () => {
            const cipher_ser = serialize(cipherText);
            const sk = serialize(elgamalVariables.sk);
            const result = wasmFunctions.elgamalDecrypt(cipher_ser, sk);
            const message = uint8ArrayToJsonObject(result)
            console.log("Elgamal decrypted message", message)
            let originalMessage = await deserialize('message.txt');
            console.log("Original message", originalMessage)
            expect(message).toEqual(originalMessage);
            expect(result).toBeInstanceOf(Uint8Array);
        });
    });

    describe('Prove and verify', () => {

        let proof_ser: Uint8ClampedArray

        let circuit_settings_ser: Uint8ClampedArray;
        let params_ser: Uint8ClampedArray;

        it('prove', async () => {
            const witness = await readDataFile('test.witness.json');
            const pk = await readDataFile('test.provekey');
            const circuit_ser = await readDataFile('test_network.compiled');
            circuit_settings_ser = await readDataFile('settings.json');
            params_ser = await readDataFile('kzg');
            const result = wasmFunctions.prove(witness, pk, circuit_ser, circuit_settings_ser, params_ser);
            proof_ser = new Uint8ClampedArray(result.buffer);
            const proof = uint8ArrayToJsonObject(result)
            console.log("Proof", proof)
            expect(result).toBeInstanceOf(Uint8Array);
        });

        it('verify', async() => {
            const vk = await readDataFile('test.key');
            const result = wasmFunctions.verify(proof_ser, vk, circuit_settings_ser, params_ser);
            expect(typeof result).toBe('boolean');
            expect(result).toBe(true);
        });
    });

    describe('Field element utils', () => {

        it('field serialization round trip fuzzing', async() => {
            const numRuns = 10; 
            for(let i = 0; i < numRuns; i++) {
                // Get a randome z-score value for testing 
                const floatingPoint = randomZScore();
                // Max scale used in the calibrate method on the main ezkl repo. 
                const maxScale = 16;
                for(let j = 0; j <= maxScale; j++) {
                    const scale = j;
                    // Convert floating point to fixed point integer valu 
                    const integer = Math.round(floatingPoint*(1<<scale));

                    const floatingPointRoundTrip = integer/(1<<scale);
    
                    const U64sSer = wasmFunctions.floatToVecU64(floatingPoint, scale);
                    let U64sOutput = uint8ArrayToJsonObject(new Uint8Array(U64sSer.buffer));
                    U64sOutput = U64sOutput.map((x: bigint) => x.toString());
                    console.debug("U64 output", U64sOutput);
                    expect(U64sSer).toBeInstanceOf(Uint8ClampedArray);

                    const result2 = wasmFunctions.vecU64ToFloat(U64sSer, scale) + 0;
                    console.debug("Vec u64s to float output", result2);
                    expect(result2).toBeCloseTo(floatingPointRoundTrip);

                    const result3 = wasmFunctions.vecU64ToInt(U64sSer);
                    let integerOutput = uint8ArrayToJsonObject(new Uint8Array(result3.buffer));
                    console.debug("Vec u64s to integer output",integerOutput);
                    expect(integerOutput).toBeCloseTo(integer);

                    let feltHexOutput = wasmFunctions.vecU64ToFelt(U64sSer);
                    console.debug("Vec u64s to field element output",feltHexOutput);
                    let referenceFelt = intToFieldElement(integerOutput);
                    console.debug(referenceFelt);
                    expect(BigInt(feltHexOutput)).toBe(referenceFelt);
                }
            }
        });
    });

});

