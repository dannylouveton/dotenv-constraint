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
})
