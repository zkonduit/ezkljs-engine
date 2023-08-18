/* tslint:disable */
/* eslint-disable */
/**
* Initialize panic hook for wasm
*/
export function init_panic_hook(): void;
/**
* Generate a poseidon hash in browser. Input message
* @param {Uint8ClampedArray} message
* @returns {Uint8Array}
*/
export function poseidonHash(message: Uint8ClampedArray): Uint8Array;
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
* Verify proof in browser using wasm
* @param {Uint8ClampedArray} proof_js
* @param {Uint8ClampedArray} vk
* @param {Uint8ClampedArray} circuit_settings_ser
* @param {Uint8ClampedArray} params_ser
* @returns {boolean}
*/
export function verify(proof_js: Uint8ClampedArray, vk: Uint8ClampedArray, circuit_settings_ser: Uint8ClampedArray, params_ser: Uint8ClampedArray): boolean;
/**
* Prove in browser using wasm
* @param {Uint8ClampedArray} witness
* @param {Uint8ClampedArray} pk
* @param {Uint8ClampedArray} circuit_ser
* @param {Uint8ClampedArray} circuit_settings_ser
* @param {Uint8ClampedArray} params_ser
* @returns {Uint8Array}
*/
export function prove(witness: Uint8ClampedArray, pk: Uint8ClampedArray, circuit_ser: Uint8ClampedArray, circuit_settings_ser: Uint8ClampedArray, params_ser: Uint8ClampedArray): Uint8Array;
