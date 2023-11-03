import { z } from 'zod'

const fileSchema = z.custom<File | null>((value) => {
    if (value === null) return false
    return value instanceof File && value.name.trim() !== ''
}, "File name can't be empty")

export const formDataSchemaProve = z.object({
    witness: fileSchema,
    pk: fileSchema,
    compiled_onnx: fileSchema,
    srs: fileSchema
})

export const formDataSchemaVerify = z.object({
    proof: fileSchema,
    vk: fileSchema,
    settings: fileSchema,
    srs: fileSchema
})
