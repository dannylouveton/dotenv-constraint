import fs from 'fs'
import { jest } from '@jest/globals'
import { validateEnv } from './index'

describe('Function: validateEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should be return an error if file not found', () => {
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory')
    })

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'file_not_found',
      },
    ])
  })
  it('should be return an error if required variable is missing', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(() => 'PORT=3000\nHOST=localhost\n')
      .mockImplementationOnce(() => 'PORT=\nHOST=\nDATABASE_NAME=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'missing',
        variable: 'DATABASE_NAME',
      },
    ])
  })
  it('should be return an error if required variable is empty', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nDATABASE_NAME=\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\nDATABASE_NAME=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'empty',
        variable: 'DATABASE_NAME',
      },
    ])
  })
  it('should be return an error if number variable not number type', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nDATABASE_NAME=database\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\nDATABASE_NAME=#number\n')

    const { success, errors } = validateEnv()

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
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(() => 'PORT=3000\nHOST=localhost\n')
      .mockImplementationOnce(() => 'PORT=\nHOST=\nDATABASE_NAME=#optional\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
  it('Should be return success if optional variable is empty', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nDATABASE_NAME=\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\nDATABASE_NAME=#optional\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
  it('should be return success if all required variable is set', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nDATABASE_NAME=database\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\nDATABASE_NAME=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
  it('should be return success if optional variable with other constraints variable is missing', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(() => 'PORT=3000\nHOST=localhost\n')
      .mockImplementationOnce(
        () => 'PORT=\nHOST=\nDATABASE_NAME=#optional#number\n'
      )

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
  it('sould be return success if optional variable with other constraints variable is empty', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nDATABASE_NAME=\n'
      )
      .mockImplementationOnce(
        () => 'PORT=\nHOST=\nDATABASE_NAME=#optional#number\n'
      )

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
  it('should return an error if a variable is duplicated', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nPORT=4000\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'duplicate',
        variable: 'PORT',
      },
    ])
  })
  it('should return multiple errors if multiple variables are duplicated', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nPORT=4000\nHOST=example.com\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'duplicate',
        variable: 'PORT',
      },
      {
        code: 'duplicate',
        variable: 'HOST',
      },
    ])
  })
  it('should return an error if a variable is duplicated more than twice', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nPORT=4000\nPORT=5000\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'duplicate',
        variable: 'PORT',
      },
    ])
  })
  it('should return errors for multiple variables with multiple duplications each', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nPORT=4000\nHOST=example.com\nPORT=5000\nHOST=test.com\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'duplicate',
        variable: 'PORT',
      },
      {
        code: 'duplicate',
        variable: 'HOST',
      },
    ])
  })
  it('should return an error if a variable is not declared in schema', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nUNKNOWN_VAR=value\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'not_in_schema',
        variable: 'UNKNOWN_VAR',
      },
    ])
  })
  it('should return multiple errors if multiple variables are not in schema', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nUNKNOWN_VAR=value\nANOTHER_VAR=test\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'not_in_schema',
        variable: 'UNKNOWN_VAR',
      },
      {
        code: 'not_in_schema',
        variable: 'ANOTHER_VAR',
      },
    ])
  })
  it('should return combined errors for duplicates and undeclared variables', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\nPORT=4000\nUNKNOWN_VAR=value\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(false)
    expect(errors).toEqual([
      {
        code: 'duplicate',
        variable: 'PORT',
      },
      {
        code: 'not_in_schema',
        variable: 'UNKNOWN_VAR',
      },
    ])
  })
  it('should ignore commented variables in .env file', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\nHOST=localhost\n# COMMENTED_VAR=value\n#ANOTHER_COMMENT=test\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
  it('should ignore empty lines in .env file', () => {
    jest
      .spyOn(fs, 'readFileSync')
      .mockImplementationOnce(
        () => 'PORT=3000\n\nHOST=localhost\n\n\n'
      )
      .mockImplementationOnce(() => 'PORT=\nHOST=\n')

    const { success, errors } = validateEnv()

    expect(success).toBe(true)
    expect(errors).toEqual([])
  })
})
