import { z } from 'zod'

const fileSchema = z.custom<File | null>((value) => {
  if (value === null) return false
  return value instanceof File && value.name.trim() !== ''
}, "File name can't be empty")

export const formDataSchemaGenVk = z.object({
  compiled_onnx: fileSchema,
  srs: fileSchema,
})

export const formDataSchemaGenPk = z.object({
  vk: fileSchema,
  compiled_onnx: fileSchema,
  srs: fileSchema,
})
