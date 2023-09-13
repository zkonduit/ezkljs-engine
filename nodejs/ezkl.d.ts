/* tslint:disable */
/* eslint-disable */
/**
* Initialize panic hook for wasm
*/
export function init_panic_hook(): void;
/**
* Converts 4 u64s to a field element
* @param {Uint8ClampedArray} array
* @returns {string}
*/
export function vecU64ToFelt(array: Uint8ClampedArray): string;
/**
* Converts 4 u64s representing a field element directly to an integer
* @param {Uint8ClampedArray} array
* @returns {Uint8ClampedArray}
*/
export function vecU64ToInt(array: Uint8ClampedArray): Uint8ClampedArray;
/**
* Converts 4 u64s representing a field element directly to a (rescaled from fixed point scaling) floating point
* @param {Uint8ClampedArray} array
* @param {number} scale
* @returns {number}
*/
export function vecU64ToFloat(array: Uint8ClampedArray, scale: number): number;
/**
* Converts a floating point element to 4 u64s representing a fixed point field element
* @param {number} input
* @param {number} scale
* @returns {Uint8ClampedArray}
*/
export function floatToVecU64(input: number, scale: number): Uint8ClampedArray;
/**
* Converts a buffer to vector of 4 u64s representing a fixed point field element
* @param {Uint8ClampedArray} buffer
* @returns {Uint8ClampedArray}
*/
export function bufferToVecOfVecU64(buffer: Uint8ClampedArray): Uint8ClampedArray;
/**
* Generate a poseidon hash in browser. Input message
* @param {Uint8ClampedArray} message
* @returns {Uint8ClampedArray}
*/
export function poseidonHash(message: Uint8ClampedArray): Uint8ClampedArray;
/**
* Generates random elgamal variables from a random seed value in browser.
* Make sure input seed comes a secure source of randomness
* @param {Uint8ClampedArray} rng
* @returns {Uint8Array}
*/
export function elgamalGenRandom(rng: Uint8ClampedArray): Uint8Array;
/**
* Encrypt using elgamal in browser. Input message
* @param {Uint8ClampedArray} pk
* @param {Uint8ClampedArray} message
* @param {Uint8ClampedArray} r
* @returns {Uint8Array}
*/
export function elgamalEncrypt(pk: Uint8ClampedArray, message: Uint8ClampedArray, r: Uint8ClampedArray): Uint8Array;
/**
* Decrypt using elgamal in browser. Input message
* @param {Uint8ClampedArray} cipher
* @param {Uint8ClampedArray} sk
* @returns {Uint8Array}
*/
export function elgamalDecrypt(cipher: Uint8ClampedArray, sk: Uint8ClampedArray): Uint8Array;
/**
* Generate a witness file from input.json, compiled model and a settings.json file.
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} input
* @param {Uint8ClampedArray} settings
* @returns {Uint8Array}
*/
export function genWitness(compiled_model: Uint8ClampedArray, input: Uint8ClampedArray, settings: Uint8ClampedArray): Uint8Array;
/**
* Verify proof in browser using wasm
* @param {Uint8ClampedArray} proof_js
* @param {Uint8ClampedArray} vk
* @param {Uint8ClampedArray} settings
* @param {Uint8ClampedArray} srs
* @returns {boolean}
*/
export function verify(proof_js: Uint8ClampedArray, vk: Uint8ClampedArray, settings: Uint8ClampedArray, srs: Uint8ClampedArray): boolean;
/**
* Prove in browser using wasm
* @param {Uint8ClampedArray} witness
* @param {Uint8ClampedArray} pk
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} settings
* @param {Uint8ClampedArray} srs
* @returns {Uint8Array}
*/
export function prove(witness: Uint8ClampedArray, pk: Uint8ClampedArray, compiled_model: Uint8ClampedArray, settings: Uint8ClampedArray, srs: Uint8ClampedArray): Uint8Array;
/**
* Mock prove in browser using wasm
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} input
* @param {Uint8ClampedArray} settings
*/
export function mock_prove(compiled_model: Uint8ClampedArray, input: Uint8ClampedArray, settings: Uint8ClampedArray): void;
/**
* Generate proving key in browser
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} srs
* @param {Uint8ClampedArray} settings
* @returns {Uint8Array}
*/
export function gen_pk(compiled_model: Uint8ClampedArray, srs: Uint8ClampedArray, settings: Uint8ClampedArray): Uint8Array;
/**
* Generate verifying key in browser
* @param {Uint8ClampedArray} pk
* @param {Uint8ClampedArray} circuit_settings_ser
* @returns {Uint8Array}
*/
export function gen_vk(pk: Uint8ClampedArray, circuit_settings_ser: Uint8ClampedArray): Uint8Array;
/**
* Prove and verify in browser for testing
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} input
* @param {Uint8ClampedArray} settings
* @param {Uint8ClampedArray} srs
* @returns {boolean}
*/
export function setupProveVerify(compiled_model: Uint8ClampedArray, input: Uint8ClampedArray, settings: Uint8ClampedArray, srs: Uint8ClampedArray): boolean;
/**
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} input
* @param {Uint8ClampedArray} settings
* @param {Uint8ClampedArray} srs
* @returns {boolean}
*/
export function setupProve_verify(compiled_model: Uint8ClampedArray, input: Uint8ClampedArray, settings: Uint8ClampedArray, srs: Uint8ClampedArray): boolean;
/**
* @param {Uint8ClampedArray} compiled_model
* @param {Uint8ClampedArray} input
* @param {Uint8ClampedArray} settings
* @param {Uint8ClampedArray} srs
* @returns {boolean}
*/
export function setup_proveVerify(compiled_model: Uint8ClampedArray, input: Uint8ClampedArray, settings: Uint8ClampedArray, srs: Uint8ClampedArray): boolean;
