import * as wasmFunctions from '@ezkljs/engine/nodejs';
import { serialize } from '@ezkljs/engine/nodejs';
import {
    readDataFile,
} from './utils';
import { deserialize } from 'v8';

describe('poseidonHash', () => {
    it('should return a Uint8Array', async () => {
        /// The message ingested by the poseidon hash
        // function must be of this format: [[u64: 4]
        // e.i. an array of 4 u64s, the standard field element
        // serialization format. 
        let message = [[0, 0, 0, 0], [1, 0, 0, 0]]
        console.log("Message that will be hashed (preimage)", message)
        // Serialize the message to a Uint8ClampedArray so that it can be ingested by the poseidonHash binding
        let message_ser = serialize(message)
        // As a sanity check, read in the message.txt file
        // which contains the same message and compare 
        // the hash of each to make sure they are equal.
        let message_file = await readDataFile('message.txt');
        const result = wasmFunctions.poseidonHash(message_ser);
        const result_file = wasmFunctions.poseidonHash(message_file);
        expect(result_file).toEqual(result);
        let hash = deserialize(result);
        console.log("Poseidon hash of message", hash)
    });
});