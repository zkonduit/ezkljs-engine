import { verify } from 'crypto';
import * as wasmFunctions from '../nodejs'
import { 
    readEzklArtifactsFile,
    readEzklSrsFile
 } from './utils';
import fs from 'fs';

let examples: string[] = [
    // "1l_mlp",
    // "1l_slice",
    // "1l_concat",
    // "1l_flatten",
    // // "1l_average",
    // "1l_div",
    // "1l_pad",
    // "1l_reshape",
    // "1l_eltwise_div",
    // "1l_sigmoid",
    // "1l_sqrt",
    // "1l_softmax",
    // // "1l_instance_norm",
    // "1l_batch_norm",
    // "1l_prelu",
    // "1l_leakyrelu",
    // "1l_gelu_noappx",
    // // "1l_gelu_tanh_appx",
    // "1l_relu",
    // "1l_downsample",
    // "1l_tanh",
    // "2l_relu_sigmoid_small",
    // "2l_relu_fc",
    // "2l_relu_small",
    // "2l_relu_sigmoid",
    // "1l_conv",
    // "2l_sigmoid_small",
    // "2l_relu_sigmoid_conv",
    // "3l_relu_conv_fc",
    // "4l_relu_conv_fc",
    // "1l_erf",
    // "1l_var",
    // "1l_elu",
    // "min",
    // "max",
    // "1l_max_pool",
    // "1l_conv_transpose",
    // "1l_upsample",
    // "1l_identity",
    // "idolmodel",
    // "trig",
    // "prelu_gmm",
    // "lstm",
    // "rnn",
    // "quantize_dequantize",
    // "1l_where",
    // "boolean",
    // "boolean_identity",
    // "decision_tree", // "variable_cnn",
    // "random_forest",
    // "gradient_boosted_trees",
    // "1l_topk",
    // "xgboost",
    // "lightgbm",
];

const timingData: { 
    example: string,
    proveTime: number, 
    verifyTime: number,
    verifyResult: boolean | undefined 
}[] = [];

describe('Generate witness, prove and verify', () => {

    // let proof_ser: Uint8ClampedArray
    // let circuit_settings_ser: Uint8ClampedArray;
    // let params_ser: Uint8ClampedArray;

    // let proveTime = 0;
    // let verifyTime = 0;
    // let verifyResult: boolean | undefined = false;

    test.each(examples)('prove -> verify %s', async (example) => {
        let result
        let witness = await readEzklArtifactsFile(example, 'input.json');
        let pk = await readEzklArtifactsFile(example, 'key.pk');
        let circuit_ser = await readEzklArtifactsFile(example, 'network.onnx');
        let circuit_settings_ser = await readEzklArtifactsFile(example, 'settings.json');
        let params_ser = await readEzklSrsFile(example);
        const startTimeProve = Date.now();
        result = wasmFunctions.prove(witness, pk, circuit_ser, circuit_settings_ser, params_ser);
        const endTimeProve = Date.now();
        let proof_ser = new Uint8ClampedArray(result.buffer);
        let proveTime = endTimeProve - startTimeProve;
        expect(result).toBeInstanceOf(Uint8Array);
        const vk = await readEzklArtifactsFile(example, 'key.vk');
        const startTimeVerify = Date.now();
        result = wasmFunctions.verify(proof_ser, vk, circuit_settings_ser, params_ser);
        const endTimeVerify = Date.now();
        let verifyTime = endTimeVerify - startTimeVerify;
        let verifyResult = result;
        expect(typeof result).toBe('boolean');
        expect(result).toBe(true);
        timingData.push({ 
            example, 
            proveTime, 
            verifyTime, 
            verifyResult 
        });
    });

    // it('prove', async () => {
    //     let result
    //     let witness = await readEzklArtifactsFile(example, 'input.json');
    //     let pk = await readEzklArtifactsFile(example, 'key.pk');
    //     let circuit_ser = await readEzklArtifactsFile(example, 'network.onnx');
    //     circuit_settings_ser = await readEzklArtifactsFile(example, 'settings.json');
    //     params_ser = await readEzklSrsFile(example);
    //     const startTimeProve = Date.now();
    //     result = wasmFunctions.prove(witness, pk, circuit_ser, circuit_settings_ser, params_ser);
    //     const endTimeProve = Date.now();
    //     proof_ser = new Uint8ClampedArray(result.buffer);
    //     proveTime = endTimeProve - startTimeProve;
    //     expect(result).toBeInstanceOf(Uint8Array);
    // });

    // it('verify', async() => {
    //     let result
    //     const vk = await readEzklArtifactsFile(example, 'key.vk');
    //     const startTimeVerify = Date.now();
    //     result = wasmFunctions.verify(proof_ser, vk, circuit_settings_ser, params_ser);
    //     const endTimeVerify = Date.now();
    //     verifyTime = endTimeVerify - startTimeVerify;
    //     verifyResult = result;
    //     expect(typeof result).toBe('boolean');
    //     expect(result).toBe(true);
    // });

    afterAll(() => {
        fs.writeFileSync('timingData.json', JSON.stringify(timingData, null, 2));
    });
});
