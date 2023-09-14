import * as wasmFunctions from '@ezkljs/engine/nodejs';
import {
    readDataFile,
} from './utils';

import JSONBig from 'json-bigint';

describe('poseidonHash', () => {
    it('should return a Uint8Array', async () => {
        /// map "string" => [[u64: 4]]
        let message = [[0, 0, 0, 0], [1, 0, 0, 0]]
        console.log("array result", Array.isArray(message))
        console.log("message type", typeof message)
        let string = JSONBig.stringify(message)
        let buffer = new TextEncoder().encode(string)
        let message_ser = new Uint8ClampedArray(buffer.buffer);
        let message_file = await readDataFile('message.txt');
        const result = wasmFunctions.poseidonHash(message_ser);
        const result_file = wasmFunctions.poseidonHash(message_file);
        expect(result_file).toEqual(result);
        expect(result).toBeInstanceOf(Uint8ClampedArray);
    });
});