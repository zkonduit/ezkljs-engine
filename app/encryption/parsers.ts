import { z } from 'zod'

const fileSchema = z.custom<File | null>((value) => {
  if (value === null) return false
  return value instanceof File && value.name.trim() !== ''
}, "File name can't be empty")

export const formDataSchemaEncrypt = z.object({
  pk: fileSchema,
  message: fileSchema,
  r: fileSchema,
})

export const formDataSchemaDecrypt = z.object({
  cipher: fileSchema,
  sk: fileSchema,
})
