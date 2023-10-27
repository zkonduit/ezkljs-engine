import { z } from 'zod'

const fileSchema = z.custom<File | null>((value) => {
    if (value === null) return false
    return value instanceof File && value.name.trim() !== ''
}, "File name can't be empty")

const textSchema = z.custom<string | null>((value) => {
    if (value === null) return false
    return typeof value === "string" && value.trim() !== ''
}, "Text can't be empty")

export const formDataSchemaEvmVerify = z.object({
    proof: fileSchema,
    bytecode_verifier: fileSchema,
    evm_version: textSchema
})
