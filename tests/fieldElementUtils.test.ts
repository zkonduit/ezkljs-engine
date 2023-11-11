
import * as wasmFunctions from '@ezkljs/engine/nodejs';
import {
    uint8ArrayToJsonObject,
    intToFieldElement,
    randomZScore
} from './utils';

describe('Field element utils', () => {

    it('field serialization round trip fuzzing', async () => {
        const numRuns = 10;
        for (let i = 0; i < numRuns; i++) {
            // Get a random z-score value for testing 
            const floatingPoint = randomZScore();
            // Max scale used in the calibrate method on the main ezkl repo. 
            const maxScale = 16;
            for (let j = 0; j <= maxScale; j++) {
                const scale = j;
                // Convert floating point to fixed point integer value
                const integer = Math.round(floatingPoint * (1 << scale));

                const floatingPointRoundTrip = integer / (1 << scale);

                // console.debug("Test floating point value", floatingPoint)
                // console.debug("Test scale (multiply floating point by 2^scale then rounding to get integer fixed point)", scale)
                // console.debug("Test integer (fixed point) value", integer);

                const U64sSer = wasmFunctions.floatToVecU64(floatingPoint, scale);
                let U64sOutput = uint8ArrayToJsonObject(new Uint8Array(U64sSer.buffer));
                U64sOutput = U64sOutput.map((x: bigint) => x.toString());
                if (i == 0 && j == 0) console.debug("Float to U64 output", U64sOutput);

                const result2 = wasmFunctions.vecU64ToFloat(U64sSer, scale) + 0;
                if (i == 0 && j == 0) console.debug("Vec u64s to float output", result2);
                // Using toBeCloseTo instead of toBe because of floating point precision loss
                expect(result2).toBeCloseTo(floatingPointRoundTrip);

                const result3 = wasmFunctions.vecU64ToInt(U64sSer);
                let integerOutput = uint8ArrayToJsonObject(new Uint8Array(result3.buffer));
                if (i == 0 && j == 0) console.debug("Vec u64s to integer output", integerOutput);
                expect(integerOutput).toBeCloseTo(integer);

                let feltHexOutput = wasmFunctions.vecU64ToFelt(U64sSer);
                if (i == 0 && j == 0) console.debug("Vec u64s to field element output (hex)", feltHexOutput);
                let referenceFelt = intToFieldElement(integerOutput);
                if (i == 0 && j == 0) console.debug("Reference field element (decimal)", referenceFelt);
                expect(BigInt(feltHexOutput)).toBe(referenceFelt);
            }
        }
    });
    it('buffer to vec of vec u64', async () => {
        const testString = "test";
        const serializedString = wasmFunctions.serialize(testString);
        const result = wasmFunctions.bufferToVecOfVecU64(serializedString);
        expect(result).toBeInstanceOf(Uint8ClampedArray);
    })
});