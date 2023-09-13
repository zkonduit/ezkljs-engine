import * as wasmFunctions from '@ezkljs/engine/nodejs';
import { 
    uint8ArrayToJsonObject,
    readDataFile,
    deserialize,
    serialize
 } from './utils';

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