import * as fs from 'fs/promises';
import * as path from 'path';
import * as wasmFunctions from '@ezkljs/engine/nodejs';
import JSONBig from 'json-bigint';

describe('wasmFunctions', () => {

    async function readDataFile(filename: string): Promise<Uint8ClampedArray> {
        const filePath = path.join(__dirname, 'public', 'data', filename);
        const buffer = await fs.readFile(filePath);
        return new Uint8ClampedArray(buffer.buffer);
    }

    function deserialize(filename: string): Promise<any> {
        return readDataFile(filename).then((uint8Array) => {
            const string = new TextDecoder().decode(uint8Array);
            const jsonObject = JSONBig.parse(string);
            return jsonObject;
        });
    }

    // Function to convert the return buffer elgamalGenRandom into a JSON object
    function uint8ArrayToJsonObject(uint8Array: Uint8Array) {
        let string = new TextDecoder().decode(uint8Array);
        let jsonObject = JSONBig.parse(string);
        return jsonObject;
    }

    function serialize(data: any): Uint8ClampedArray {
        // Step 1: Stringify the Object with BigInt support
        const jsonString = JSONBig.stringify(data);
        
        // Step 2: Encode the JSON String
        const uint8Array = new TextEncoder().encode(jsonString);
        
        // Step 3: Convert to Uint8ClampedArray
        return new Uint8ClampedArray(uint8Array.buffer);
    }
    

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

});

