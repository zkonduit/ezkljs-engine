import * as wasmFunctions from '@ezkljs/engine/nodejs';
import { 
    readDataFile,
 } from './utils';


describe('Generate witness, prove and verify', () => {

    let proof_ser: Uint8ClampedArray
    let params_ser: Uint8ClampedArray;

    let proveTime = 0;
    let verifyTime = 0;
        
    it('prove', async () => {
        let result
        let witness = await readDataFile('test.witness.json');
        let pk = await readDataFile('test.provekey');
        let circuit_ser = await readDataFile('test_network.compiled');
        params_ser = await readDataFile("kzg");
        const startTimeProve = Date.now();
        result = wasmFunctions.prove(witness, pk, circuit_ser, params_ser);
        const endTimeProve = Date.now();
        proof_ser = new Uint8ClampedArray(result.buffer);
        proveTime = endTimeProve - startTimeProve;
        console.log("proveTime", proveTime)
        expect(result).toBeInstanceOf(Uint8Array);
    });

    it('verify', async() => {
        let result
        const vk = await readDataFile('test.key');
        let circuit_settings_ser = await readDataFile('settings.json');
        const startTimeVerify = Date.now();
        result = wasmFunctions.verify(proof_ser, vk, circuit_settings_ser, params_ser);
        const endTimeVerify = Date.now();
        verifyTime = endTimeVerify - startTimeVerify;
        console.log(verifyTime)
        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
    });
});
