import { z } from 'zod'

const numberSchema = z.custom<number | null>((value) => {
  if (value === null) return false
  // Non negative integer
  if (typeof value === 'string') {
    let number = parseFloat(value)
    return Number.isInteger(number) && number >= 0
  }
}, 'Please enter a valid non-negative scale value')

const vecU64Schema = z.custom<string | null>((value) => {
  if (value === null) return false
  // Non negative integer
  if (typeof value === 'string') {
    try {
      // parse the string as an array
      let array = JSON.parse(value)
      // check that the array is of length 4
      let length4 = array.length === 4
      // check that all elements are integers
      let allIntegers = array.every((element: number) =>
        Number.isInteger(element),
      )
      // check that all elements are positive
      let allPositive = array.every((element: number) => element >= 0)
      return allIntegers && allPositive && length4
    } catch (e) {
      console.log('error', e)
      return false
    }
  }
}, 'Please enter a valid vecU64 of length 4')

const floatSchema = z.custom<string | null>((value) => {
  if (value === null) return false
  console.log('value type', typeof value)
  if (typeof value === 'string') {
    console.log('value is string')
    return !Number.isNaN(parseFloat(value.toString()))
  }
}, 'Please enter a valid floating point value')

export const formDataSchemaFloatToVecU64 = z.object({
  fp: floatSchema,
  scale: numberSchema,
})

export const formDataSchemaVecU64ToFloat = z.object({
  vecU64: vecU64Schema,
  scale: numberSchema,
})

export const formDataSchemaVecU64ToInt = z.object({
  vecU64: vecU64Schema,
})

export const formDataSchemaVecU64ToFelt = z.object({
  vecU64: vecU64Schema,
})
