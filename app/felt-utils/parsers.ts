import { z } from 'zod'

const numberSchema = z.custom<number | null>((value) => {
  if (value === null) return false
  // Non negative integer
  if (typeof value === 'string') {
    let number = parseFloat(value)
    return Number.isInteger(number) && number >= 0
  }
}, 'Please enter a valid non-negative scale value')

const FeltSchema = z.custom<string | null>((value) => {
  if (value === null) return false
  // Non negative integer
  if (typeof value === 'string') {
    try {
      return value
    } catch (e) {
      console.log('error', e)
      return false
    }
  }
}, 'Please enter a valid Felt')

const floatSchema = z.custom<string | null>((value) => {
  if (value === null) return false
  console.log('value type', typeof value)
  if (typeof value === 'string') {
    console.log('value is string')
    return !Number.isNaN(parseFloat(value.toString()))
  }
}, 'Please enter a valid floating point value')

export const formDataSchemaFloatToFelt = z.object({
  fp: floatSchema,
  scale: numberSchema,
})

export const formDataSchemaFeltToFloat = z.object({
  Felt: FeltSchema,
  scale: numberSchema,
})

export const formDataSchemaFeltToInt = z.object({
  Felt: FeltSchema,
})

export const formDataSchemaFeltToFelt = z.object({
  Felt: FeltSchema,
})
