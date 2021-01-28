/* global jest test expect */

const catkeyIsPresent = require('./catkeyIsPresent')
const locateKeysDir = require('./locateKeysDir')
const loadAllKeys = require('./loadAllKeys')
const loadCert = require('./loadCert')

jest.mock('./locateKeysDir')
jest.mock('./locateKeysDir')
jest.mock('./loadAllKeys')
jest.mock('./loadCert')

const mockCatkeyExists = { modulus: 'mock_modulus_exists' }
const mockCatkeyNoExists = 'mock_modulus_no_exists'
const mockCatkeys = [
  { cert: mockCatkeyExists },
  { cert: { modulus: 'mock_modulus_exists_2' } }
]
const mockCatkeysDir = '/env/path/to/catkeys'

loadAllKeys.mockReturnValue(Promise.resolve(mockCatkeys))
loadCert.mockImplementation((cert) => cert)
locateKeysDir.mockReturnValue(mockCatkeysDir)

test(
  'should return true when key modulus matches an exisiting catkey',
  async () => {
    await expect(catkeyIsPresent(mockCatkeyExists)).resolves.toBe(true)
  }
)

test(
  'should return false when key modulus matches an exisiting catkey',
  async () => {
    await expect(catkeyIsPresent(mockCatkeyNoExists)).resolves.toBe(false)
  }
)

test(
  'should use path to catkeys dir when present in args',
  async () => {
    const mockCatkeysDir = '/env/path/to/catkeys/arg'

    await catkeyIsPresent(mockCatkeyExists, { catKeysDir: mockCatkeysDir })

    expect(loadAllKeys).toBeCalledWith(mockCatkeysDir)
  }
)

test(
  'should use path to catkeys dir when present in env var',
  async () => {
    const mockCatkeysDir = '/env/path/to/catkeys/env'

    process.env.CAT_KEYS_DIR = mockCatkeysDir
    await catkeyIsPresent(mockCatkeyExists)

    expect(loadAllKeys).toBeCalledWith(mockCatkeysDir)
  }
)
