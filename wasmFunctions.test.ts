import * as wasmFunctions from './pkg';

describe('wasmFunctions', () => {
  
  describe('poseidonHash', () => {
    it('should return a Uint8Array', () => {
      const message = new Uint8ClampedArray([1, 2, 3, 4, 5]);
      const result = wasmFunctions.poseidonHash(message);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('elgamalGenRandom', () => {
    it('should return a Uint8Array', () => {
      const rng = new Uint8ClampedArray([1, 2, 3, 4, 5]);
      const result = wasmFunctions.elgamalGenRandom(rng);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('elgamalEncrypt', () => {
    it('should return a Uint8Array', () => {
      const pk = new Uint8ClampedArray([1, 2, 3]);
      const message = new Uint8ClampedArray([4, 5, 6]);
      const r = new Uint8ClampedArray([7, 8, 9]);
      const result = wasmFunctions.elgamalEncrypt(pk, message, r);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('elgamalDecrypt', () => {
    it('should return a Uint8Array', () => {
      const cipher = new Uint8ClampedArray([1, 2, 3]);
      const sk = new Uint8ClampedArray([4, 5, 6]);
      const result = wasmFunctions.elgamalDecrypt(cipher, sk);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('verify', () => {
    it('should return a boolean', () => {
      const proof_js = new Uint8ClampedArray([1, 2, 3]);
      const vk = new Uint8ClampedArray([4, 5, 6]);
      const circuit_settings_ser = new Uint8ClampedArray([7, 8, 9]);
      const params_ser = new Uint8ClampedArray([10, 11, 12]);
      const result = wasmFunctions.verify(proof_js, vk, circuit_settings_ser, params_ser);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('prove', () => {
    it('should return a Uint8Array', () => {
      const witness = new Uint8ClampedArray([1, 2, 3]);
      const pk = new Uint8ClampedArray([4, 5, 6]);
      const circuit_ser = new Uint8ClampedArray([7, 8, 9]);
      const circuit_settings_ser = new Uint8ClampedArray([10, 11, 12]);
      const params_ser = new Uint8ClampedArray([13, 14, 15]);
      const result = wasmFunctions.prove(witness, pk, circuit_ser, circuit_settings_ser, params_ser);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

});

