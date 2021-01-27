/* global jest test expect */

const cahkeyIsPresent = require('./cahkeyIsPresent')
const locateKeysDir = require('./locateKeysDir')
const loadAllKeys = require('./loadAllKeys')
const loadCert = require('./loadCert')

jest.mock('./locateKeysDir')
jest.mock('./locateKeysDir')
jest.mock('./loadAllKeys')
jest.mock('./loadCert')

const mockCahkeyExists = { modulus: 'mock_modulus_exists' }
const mockCahkeyNoExists = 'mock_modulus_no_exists'
const mockCahkeys = [
  { cert: mockCahkeyExists },
  { cert: { modulus: 'mock_modulus_exists_2' } }
]
const mockCahkeysDir = '/env/path/to/cahkeys'

loadAllKeys.mockReturnValue(Promise.resolve(mockCahkeys))
loadCert.mockImplementation((cert) => cert)
locateKeysDir.mockReturnValue(mockCahkeysDir)

test(
  'should return true when key modulus matches an exisiting cahkey',
  async () => {
    await expect(cahkeyIsPresent(mockCahkeyExists)).resolves.toBe(true)
  }
)

test(
  'should return false when key modulus matches an exisiting cahkey',
  async () => {
    await expect(cahkeyIsPresent(mockCahkeyNoExists)).resolves.toBe(false)
  }
)

test(
  'should use path to cahkeys dir when present in args',
  async () => {
    const mockCahkeysDir = '/env/path/to/cahkeys/arg'

    await cahkeyIsPresent(mockCahkeyExists, { cahKeysDir: mockCahkeysDir })

    expect(loadAllKeys).toBeCalledWith(mockCahkeysDir)
  }
)

test(
  'should use path to cahkeys dir when present in env var',
  async () => {
    const mockCahkeysDir = '/env/path/to/cahkeys/env'

    process.env.CAH_KEYS_DIR = mockCahkeysDir
    await cahkeyIsPresent(mockCahkeyExists)

    expect(loadAllKeys).toBeCalledWith(mockCahkeysDir)
  }
)
