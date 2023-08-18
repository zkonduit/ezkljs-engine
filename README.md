## Installation

To install EZKL engine, simply use your favorite package manager:

```shell
# npm
npm install @ezkljs/engine

# yarn
yarn add @ezkljs/engine

# pnpm
pnpm add @ezkljs/engine
```

---

## Engine ([example usage in Next.js](https://github.com/zkonduit/ezkl))

To get started using EZKL Engine in your appplication you'll want to use the `engine` submodule.

```typescript
import engine from '@ezkljs/engine'
```

  elgamalGenRandom,
  elgamalEncrypt,
  elgamalDecrypt,
  prove, 
  poseidonHash, 
  verify 
The engine exposes useful JS bindings to the main ezkl repo that make hashing, encrypting, decrypting, proving and verifying in the browser seemless:

- [elgamalGenRandom](#elgamal-variables): Generate an ElGamal keypair from a random seed
- [elgamalEncrypt](#elgamal-encrypt): Encypt an arbitrary message using the ElGamal public key and randomness 
- [elgamalDecrypt](#elgamal-decrypt): Decrypt a cipher text using the ElGamal secret key
- [prove](#prove): Generate a proof
- [verify](#verify): Verify a given proof
- [poseidonHash](#hash): Hash a given message using the Poseidon hash function

---

### Elgamal Variables

You can generate a random ElGamal keypair from a random seed to use for encryption and decryption by using the `elgamalGenRandom` method.

```typescript
import { elgamalGenRandom } from '@ezkljs/engine'
// Import the JSONBig library for parsing the Uint8Array response from elgamalGenRandom
// We use JSONBig since some of the u64s returned by elgamalGenRandom
// are too large for JSON to parse. 
import JSONBig from 'json-bigint'

function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder(); 
  const uint8Array = encoder.encode(str);
  return uint8Array;
}

// Function to generate a 256 bit seed in the browser 
// using a cryptographically secure source of randomness. 
// DO NOT USE MATH.RANDOM AS ITS NOT A SECURE SOURCE OF RANDOMNESS
function generate256BitSeed(): Uint8ClampedArray {
  const uuid = self.crypto.randomUUID();
  const buffer = stringToUint8Array(uuid);
  let seed = self.crypto.getRandomValues(buffer);
  seed = seed.slice(0, 32);
  return new Uint8ClampedArray(seed.buffer);
}

// Function to convert the return buffer elgamalGenRandom into a JSON object
function uint8ArrayToJsonObject(uint8Array) {
    let string = new TextDecoder().decode(uint8Array);
    let jsonObject = JSONBig.parse(string);
    return jsonObject;
}

const buffer = elgamalGenRandom(generate256BitSeed())

// We can take a look at the serialized contents of the 
// buffer returned by elgamalGenRandom by converting 
// the Uint8Array to a JSON object
let elgamalVariables = uint8ArrayToJsonObject(buffer)

console.log(JSON.stringify(elgamalVariables, null, 2))
```

Output:

```json
{
  "r": [
    "3454421873345507054",
    "16808310348879090885",
    "8288793628600014913",
    "1828575853528138165"
  ],
  "sk": [
    "8833745371820985590",
    "8074024378078747364",
    "11905923764904461178",
    "851912620759564510"
  ],
  "pk": [
    [
      "10721601427614006364",
      "165460855961439422",
      "2494139285445986520",
      "993922445972607230"
    ],
    [
      "11418900806032782576",
      "15880182954156597531",
      "16112055391177898581",
      "485390167428225782"
    ]
  ],
  "aux_generator": [
    [
      "13503889609873471352",
      "8660427972151475473",
      "16373159693836788928",
      "3475191407935738629"
    ],
    [
      "9899281824843853575",
      "11168630486339379471",
      "550474616581266472",
      "3277527638473654200"
    ]
  ],
  "window_size": 4
}
```

---

### Elgamal Encrypt

Using the public key (pk) and randomness (r) from the previous step, you can encrypt an arbitrary message using the `elgamalEncrypt` method.
In the example app we use this [ElgamalZipFileDownload](https://github.com/zkonduit/ezkljs-engine/blob/main/app/Utils.tsx#L84) method to download the 
r, sk and pk fields of the elgamalVariables as JSON files. 

Once you have downloaded your Elgamal variables by clicking the "Generate" button at the top of the page, 
you can unzip the "elgamal_var" file in your download folder. 

After which you need to create a text file that contains a message you wish to encrypt.  
Since elgamal encrypt is a ZKP operation, we need to convert the message into
serialized field elements represented as u254s. We serialize the field elemnents 
by breaking up each u254 field element into 4 u64s. 

For reference, check out the example message file [here](https://github.com/zkonduit/ezkljs-engine/tree/main/public/data/message.txt)


```typescript
import { elgamalEncrypt } from '@ezkljs/engine'

// This is the code for the button that triggers the 
// generation of the elgamal encyrption ciphertext. 

export async function handleGenElgamalEncryptionButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now();  // Start the timer

  let output = elgamalEncrypt(
    result['pk'],
    result['message'],
    result['r']
  )

  const end = performance.now();  // End the timer

  let cipherText = uint8ArrayToJsonObject(output)

  console.log(JSON.stringify(cipherText, null, 2))    

  return {
    output: output,
    executionTime: end - start
  }
}
```

Output:

```json
[
  [
    [
      "10209188590651781239",
      "1606867371818388001",
      "2009969314029440862",
      "68539226482053667"
    ],
    [
      "11542493346099842483",
      "15506753538305362096",
      "11085744708984070406",
      "1449434265777497591"
    ],
    [
      "14888253900846995994",
      "17596893823803099477",
      "7958618303962015576",
      "30430041561409514"
    ]
  ],
  [
    [
      "10873062863189913544",
      "1639997932972316199",
      "7128784801669346971",
      "2001604198948701760"
    ],
    [
      "10873062863189913545",
      "1639997932972316199",
      "7128784801669346971",
      "2001604198948701760"
    ]
  ]
]
```

---

### Elgamal Decrypt

Using the secret key (sk) and ciphertext from the previous step, you can decrypt the ciphertext using the `elgamalDecrypt` method.

```typescript
import { elgamalDecrypt } from '@ezkljs/engine'

// This is the code for the button that triggers the 
// generation of the elgamal decryption of the ciphertext. 
export async function handleGenElgamalDecryptionButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)
  const start = performance.now();  // Start the timer

  let output = elgamalDecrypt(
    result['cipher'],
    result['sk']
  )

  const end = performance.now();  // End the timer

  let message = uint8ArrayToJsonObject(output)

  console.log(JSON.stringify(message, null, 2))   

  return {
    output: output,
    executionTime: end - start
  }
}
```

Output:

```json
[
  [
    0,
    0,
    0,
    0
  ],
  [
    1,
    0,
    0,
    0
  ]
]
```
And as you can see, the output matches the original message inside of message.txt that we encrypted :-)


---

### Prove

Once you have all the necessary artifacts needed to prove (Input Data, Proving Key, Model (.onnx), Circuit settings and SRS) you can generate a proof using the `prove` method.


```typescript
import { prove } from '@ezkljs/engine'

// This is the code for the button that triggers the 
// generation of a proof.
export async function handleGenProofButton<T extends FileMapping>(
  files: T,
): Promise<Uint8ArrayResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now();  // Start the timer

  let output = prove(
    result['data'],
    result['pk'],
    result['model'],
    result['circuitSettings'],
    result['srs'],
  )
  
  const end = performance.now();  // End the timer

  let proof = uint8ArrayToJsonObject(output)

  console.log(JSON.stringify(proof.proof, null, 2))
  console.log(JSON.stringify(proof.instances, null, 2))

  return {
    output: output,
    executionTime: end - start
  }
}
```

Output:

```json
"061557cfc629ce604da894831cd029d0444acf4f7e384d980e1ba7a5204f71a42a4c51e0a713df141416fd197367b56cfb3a56b1a5c7bd137f25046aa051665612f99bb5511db4b3d582f052ec82ed49356370e792ac669a8e940d3568285bbc10c78295369f844ada048e5efa897a227f05f68cc62706b145f88e3f943e559021dcd03884e21668db5cd925ce6807d6549e851709a7a3a8ac7b9666d1b2c0100d8a2682aa56d96a2ce8d0ae671e0c35c9c43e380308d246e7613122beca4f0828cdf8c9eebb0d9ee5a82a99a16c83ee5af9830a532a37c20e9f007d3f0312c200bd527998d6bbf40fab9e56bebd691ccc8131800a9b52851aea5019d06b736c1c44165d3c1992de958365a24f151606a4a50ffd121765d5283f7f809fa684432504487d8c48f12aeaf9caf30133f9ab1ec820e18db051b2ea31f2a10174514c2fe7a9f069c9913c3ee92a5deb9ab2fe9960d9a538ca00c3e0fb2cc457b899702aa74659de954943d3a5b589f82502693997178fa55a4f8677cd908e8ddcd9801cb371b84319454d1e8e1028f61bd355ae90689f6d3793444cb343cfe4ea637f2171d720686e0de1415d608c66ea9780c1abc0c884520e81a79ff8c11f5c339c2fb76fc9740cadb6eacee21f5c4adda72dce152d513c6562f3a7d23acfa83eff124945177df5433f7929730caae3622748a1ca86a0f73d838fcdb35f2a5686f02cba638cb1e5dff403519bf4813c60782f79cf08f2e583c490670e126a21213704fde2b3a4f9a8c418b3278bfe2f55ff47c6aa2015ded6752829b3cee375941315c98e5e31d0f4ec9b894ec51fee3941c438c974c51c41316de87b09be96f5f00fcfd4a5f556069e5798f49de750328088864927d4e4fe981550e5db1b981cff01ec4b2d03f63d3b4af7dd228f44c0b9b0ad4b72caf9bf7d4cd8c5b0ca51a9cd13fcda2a4cac59a8dd387ee6f503bbfd463ee379fb89aaa0cd6cffcbd95bb7ac1a1fa808ce43262d64c2fe355fdeae74ed366d27840dda8d0fe55ba6ffcef20e1be8475b82348ec92e6025c2496e11448d8b33377a360fca6d2918898a686c982db58e3bd42491992af5b4aea77e6991ae1f039f87bd3ed19b9ec74423956a3708d42d087723886ddd1c5486ed16610a123250c3c5e6014689d2767b4b4e22ef1e3af64dee3c29529c19be5081fdcb0a40171965ad5985dd942a836617f9dbbe012f27810b056ecc44636fadbc71943de4a20ffd3dc97238b0dbca16be8c10180d116ba8cc95eeb91d10d5e19f59303e984a845437a2c850021b2aa3c2141b3e020d1469095d76fb8298a870761fd2fcc2fc8057bf030f62ac3144a5770c60b0000000000000000000000000000000000000000000000000000000000000000025865fabaaa498f6b2042243bea2276cc7cdcf25e091f96a43eddaefd2a6a935013a3354557867640b7e902a005357c86c983aaee40bccb10eb8d6db6415915e1b477e066537576f70026752c4a27da71d491787297c18ba10f2a42db41b13df2d4096ced97df14e8c89a27bbc0e26b828dad7f5005e98e201992d3849611f520a0ed6030f402c363e526bf3607cced57998af94af4b6800ba87a685edbf742b202130ece182d26daefcfbe7412ff629407701d9adeff18446edaefd9abf6c98000000000000000000000000000000000000000000000000000000000000000000bda3a6a626469e211146d2f95c86d27f2a5b9d6d68f0a9670cee1243955c0f0ae946af8d44a1c2d448c9e024d2bbe96e5d2fea5d7915ca8eb481149bfadef20ecfee1f2b7d4a2ab4df06e00486bc1bd1c617f4d59a63fc2ec237594364f7510230555057f2f18e41e3d497f29bc9a30e2cbb17896f3e7f47ae0c010264b74501a6e3c81f4a937b66fc4baa9aa1cd062cdffdfecfef96f25b52f904c8b9d5b00fdd517551727930dd77dd45abee71f7aa50966d6e97aa4ba24831bacdd6354a18930a821ae32be9c13e66e4cb2a82c4d9e9ffd500c812c9a9a731a288d9c2361888a4e1b1a43df2fe0eca25a20025b1fccef7a4da7f808e59d050b652551fa100eeac3b40d1280d81aba6a3bfb433421427713de0d5d0b0a3639f1c7a4be64b2949b981ef4878eece723328d64def0ad4df93a2774d6a882ff0b6cd039239d627305afa05611ce6705dedef6c8cb221a1f251df9b3f1a04bb66ddc64a3feac51c01e60a44f75a12585a003ae3ddfdefa7568d8b30a31e2e5e8252aa9f34e476253ae4d74edd37762da29a7287184a2b7052d3b133721407aa36b5c9996e68c70b754ea01d61e33600675eb551a78f9fbb5b2abaf9a6b4c06b6cb2046b1eba8b2691a9fb51778a8bb703a618ff4406336431f38dd6927b254bc13428883ae6520e7139fcf91c3ec9c1e2cffbd588759f55308bdde05292d97988056e23a5814c1725005ba922bcadd7efbe9144f55628330b6d6d7e75d634b917e69b648ef2fc267660bd34097a148cbce8d2e9bfb96c57c8de474bd0e8de959f76f7eea00cfe05de16ea880ec32cf78d401a6210bec843dbdcc3b55df477887fce3b921ec76a019098130b9a6bcde1ea663d118e28e6b1878a5826679483ab408ed1a128561d0b62d261638e6f75f70b0406102cf15270c719be349cadec69638972ffc3dfed2afa94ed6db88dd30fc3c370115a1b317c6994f1afb1b74e1bf123b176f5665e2f419728174208207da99c5a6fbf8eaadecfbbd7d028866dcc737b8bff64b8c40bb3ca88b64c55a6b6ecafc5336c130eafc53d44a40e26a3b0bd8270bfa32c2e"

[
  [
    [
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0
    ],
    [
      0,
      0,
      0,
      0
    ]
  ]
]
```

---

### Verify

When the proof has generated, you can verify it using the `verify` method. In addition to the proof, you will need to pass the file contents of the 
verification key, circuit settings and srs files. If all the artifacts are  correct, the verify method will return true.

```typescript
import { verify } from '@ezkljs/engine'

// This is the code for the button that triggers the
// verification of a proof.
export async function handleVerifyButton<T extends FileMapping>(
  files: T,
): Promise<VerifyResult> {
  const result = await convertFilesToFilesSer(files)

  const start = performance.now();  // Start the timer

  let output = verify(
    result['proof'],
    result['vk'],
    result['circuitSettings'],
    result['srs'],
  )

  const end = performance.now();  // End the timer

  console.log(output)

  return {
    output: output,
    executionTime: end - start
  }
}
```

Output:

```json
true
```

### Hash

We can also use the engine to hash a given message using the Poseidon hash function. 
Like with the elgamal encryption and decryption, we need to convert the message into
serialized field elements. 


```typescript
import { hash } from '@ezkljs/engine'

// This is the code for the button that triggers the
// posiedon hashing of a message.
export async function handleGenHashButton(message: File): Promise<Uint8Array> {
  const message_hash = await readUploadedFileAsBuffer(message)
  let output = poseidonHash(message_hash)
  let hash = uint8ArrayToJsonObject(output)
  console.log(JSON.stringify(hash, null, 2))
  return output
}
```
If you use the same message.txt file from the elgamal encryption example, you should get the following output:

```json
[
  [
    [
      "11803729404268464273",
      "978666863701269549",
      "3979600028898666103",
      "2559194768255192844"
    ]
  ]
]
```


