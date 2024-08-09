import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

type EnvSchema = {
  name: string
  constraints: {
    optional: boolean
    number: boolean
  }
}[]

type EnvVariable = {
  name: string
  value: string | undefined
}

type EnvVariables = EnvVariable[]

export const envConstraint = (envFile?: string, envSchemaFile?: string) => {
  if (!envFile) {
    envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8')
  }
  if (!envSchemaFile) {
    envSchemaFile = fs.readFileSync(path.join(__dirname, '../.env.schema'), 'utf8')
  }

  const envVariables: EnvVariables = extractEnvVariables(envFile)
  const envSchema = extractEnvSchema(envSchemaFile)

  const result = checkConstraints(envVariables, envSchema)

  if (result !== true) {
    return {
      errors: result,
      success: false
    }
  }
  return {
    errors: {},
    success: true
  }
}

const extractEnvVariables = (dotenvFile: string) => {
  const envVariables: EnvVariables = []
  for (const line of dotenvFile.split('\n')) {
    if (line.includes('=')) {
      const [name, value] = line.split('=')
      envVariables.push({ name, value })
    }
  }
  return envVariables
}

const extractEnvSchema = (schemaFile: string) => {
  const schema: EnvSchema = []
  for (const line of schemaFile.split('\n')) {
    if (line.includes('=')) {
      const name = line.split('=')[0]
      const optional = line.includes('#optional')
      const number = line.includes('#number')
      schema.push({ name, constraints: { optional, number } })
    }
  }
  return schema
}

const checkConstraints = (envVariables: EnvVariables, envSchema: EnvSchema) => {
  const errors: any = []
  for (const { name, constraints } of envSchema) {
    const envVariable = envVariables.find((v) => v.name === name)
    if (!envVariable && !constraints.optional) {
      errors.push({
        code: 'required',
        variable: name
      })
    } else if (envVariable) {
      if (constraints.number) {
        const result = isNumber(envVariable)
        if (result !== true) {
          errors.push(result)
        }
      }
      if (!constraints.optional) {
        const result = isRequired(envVariable)
        if (result !== true) {
          errors.push(result)
        }
      }
    }
  }
  if (errors.length) {
    return errors
  }
  return true
}

const isRequired = (envVariable: EnvVariable) => {
  if (!envVariable.value) {
    return {
      code: 'required',
      variable: envVariable.name
    }
  }
  return true
}

const isNumber = (envVariable: EnvVariable) => {
  if (envVariable.value && isNaN(Number(envVariable.value))) {
    return {
      code: 'invalid_type',
      expected: 'number',
      variable: envVariable.name
    }
  }
  return true
}

export default {
  envConstraint
}

// 💡
// add string, number etc
// system to display warning or throw errors
// folder with contributors can add constraints to the schema
// generate type from schema in environment.d.ts
