import { z } from 'zod'

const fileSchema = z.custom<File | null>((value) => {
  if (value === null) return false
  return value instanceof File && value.name.trim() !== ''
}, "File name can't be empty")

export const formDataSchemaEvmVerify = z.object({
  proof: fileSchema,
  bytecode_verifier: fileSchema,
})
