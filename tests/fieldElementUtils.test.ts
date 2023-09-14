
import * as wasmFunctions from '@ezkljs/engine/nodejs';
import { 
    uint8ArrayToJsonObject,
    intToFieldElement,
    randomZScore
 } from './utils';

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