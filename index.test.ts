import { envConstraint } from './index.js'

describe('Function: envConstraint', () => {
  it("should be return an error if required variable is missing'", () => {
    const envFile = 'PORT=3000\nHOST=localhost\n'
    const envSchemaFile = 'PORT=\nHOST=\nDATABASE_NAME=\n'

    const { success, errors } = envConstraint(envFile, envSchemaFile)

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'required',
        variable: 'DATABASE_NAME',
      },
    ])
  })
  it("should be return an error if required variable is empty'", () => {
    const envFile = 'PORT=3000\nHOST=localhost\nDATABASE_NAME=\n'
    const envSchemaFile = 'PORT=\nHOST=\nDATABASE_NAME=\n'

    const { success, errors } = envConstraint(envFile, envSchemaFile)

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'required',
        variable: 'DATABASE_NAME',
      },
    ])
  })
  it("should be return an error if number variable not number type'", () => {
    const envFile = 'PORT=3000\nHOST=localhost\nDATABASE_NAME=database\n'
    const envSchemaFile = 'PORT=\nHOST=\nDATABASE_NAME=#number\n'

    const { success, errors } = envConstraint(envFile, envSchemaFile)

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'invalid_type',
        expected: 'number',
        variable: 'DATABASE_NAME',
      },
    ])
  })
  it('Should be return success if optional variable is missing', () => {
    const envFile = 'PORT=3000\nHOST=localhost\n'
    const envSchemaFile = 'PORT=\nHOST=\nDATABASE_NAME=#optional\n'

    const { success, errors } = envConstraint(envFile, envSchemaFile)

    expect(success).toBe(true)
    expect(errors).toEqual({})
  })
  it('Should be return success if optional variable is empty', () => {
    const envFile = 'PORT=3000\nHOST=localhost\nDATABASE_NAME=\n'
    const envSchemaFile = 'PORT=\nHOST=\nDATABASE_NAME=#optional\n'

    const { success, errors } = envConstraint(envFile, envSchemaFile)

    expect(success).toBe(true)
    expect(errors).toEqual({})
  })
  it("should be return success if all required variable is set'", () => {
    const envFile = 'PORT=3000\nHOST=localhost\nDATABASE_NAME=database\n'
    const envSchemaFile = 'PORT=\nHOST=\nDATABASE_NAME=\n'

    const { success, errors } = envConstraint(envFile, envSchemaFile)

    expect(success).toBe(true)
    expect(errors).toEqual({})
  })
})

// TODO:
// test si le fichier n'existe pas
// test si il manque les = dans le schema
// test optional
// test extractEnvSchema
