import fs from 'fs'
import path from 'path'

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

type dotenvErrorsCode = 'empty' | 'invalid_type' | 'file_not_found' | 'missing' | 'duplicate' | 'not_in_schema'

type dotenvErrors = {
  code?: dotenvErrorsCode
  variable?: string
  expected?: string
}

type dotenvResult = {
  errors: dotenvErrors[]
  success: boolean
}
export const validateEnv = (config?: {
  dotenvPath?: string
  schemaPath?: string
}): dotenvResult => {
  const appRoot = process.cwd()
  let envFile: string
  let envSchemaFile: string

  try {
    envFile = fs.readFileSync(
      path.join(appRoot, config?.dotenvPath ?? '.env'),
      'utf8'
    )
    envSchemaFile = fs.readFileSync(
      path.join(appRoot, config?.schemaPath ?? '.env.schema'),
      'utf8'
    )
  } catch (error) {
    return {
      errors: [
        {
          code: 'file_not_found',
        },
      ],
      success: false,
    }
  }

  const envVariables: EnvVariables = extractEnvVariables(envFile)
  const envSchema = extractEnvSchema(envSchemaFile)

  const duplicateErrors = checkDuplicates(envVariables)
  const undeclaredErrors = checkUndeclared(envVariables, envSchema)
  const constraintErrors = checkConstraints(envVariables, envSchema)

  const allErrors = [...duplicateErrors, ...undeclaredErrors, ...constraintErrors]

  return {
    errors: allErrors,
    success: allErrors.length === 0,
  }
}

const extractEnvVariables = (dotenvFile: string) => {
  const envVariables: EnvVariables = []
  for (const line of dotenvFile.split('\n')) {
    const trimmedLine = line.trim()
    // Ignore empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }
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

const checkDuplicates = (envVariables: EnvVariables) => {
  const errors: dotenvErrors[] = []
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const { name } of envVariables) {
    if (seen.has(name)) {
      duplicates.add(name)
    }
    seen.add(name)
  }

  for (const name of duplicates) {
    errors.push({
      variable: name,
      code: 'duplicate',
    })
  }

  return errors
}

const checkUndeclared = (envVariables: EnvVariables, envSchema: EnvSchema) => {
  const errors: dotenvErrors[] = []
  const schemaVariables = new Set(envSchema.map((s) => s.name))

  for (const { name } of envVariables) {
    if (!schemaVariables.has(name)) {
      errors.push({
        variable: name,
        code: 'not_in_schema',
      })
    }
  }

  return errors
}

const checkConstraints = (envVariables: EnvVariables, envSchema: EnvSchema) => {
  const errors: dotenvErrors[] = []
  for (const { name, constraints } of envSchema) {
    const envVariable = envVariables.find((v) => v.name === name)
    if (!envVariable && !constraints.optional) {
      errors.push({
        variable: name,
        code: 'missing',
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
  return errors
}

const isRequired = (envVariable: EnvVariable): dotenvErrors | true => {
  if (!envVariable.value) {
    return {
      variable: envVariable.name,
      code: 'empty',
    }
  }
  return true
}

const isNumber = (envVariable: EnvVariable): dotenvErrors | true => {
  if (envVariable.value && isNaN(Number(envVariable.value))) {
    return {
      variable: envVariable.name,
      code: 'invalid_type',
      expected: 'number',
    }
  }
  return true
}

export default {
  validateEnv,
}
