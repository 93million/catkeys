/* global jest test expect beforeEach */

const getCAHKeyPath = require('./getCAHKeyPath')
const locateKeysDir = require('./locateKeysDir')
const fs = require('fs')

const cahKey = 'testkey'
const dirKeyFileName = 'testclient.cahkey'
const cahKeyDir = '/test/cahkeys/dir'
const mockDirList = ['server.cahkey', dirKeyFileName]

jest.mock('./locateKeysDir')
jest.mock('fs')

beforeEach(() => {
  locateKeysDir.mockReset()
  locateKeysDir.mockReturnValue(Promise.resolve(cahKeyDir))
  delete process.env.CAH_KEY_NAME
  delete process.env.CAH_KEYS_DIR
  fs.readdir.mockImplementation((path, callback) => {
    callback(null, mockDirList)
  })
})

test(
  'should return path to key when supplied as argument',
  async () => {
    await expect(getCAHKeyPath(cahKey))
      .resolves.toBe(`${cahKeyDir}/${cahKey}.cahkey`)
  }
)

test(
  'should return path to key when key name present in env var',
  async () => {
    const cahKey = 'testkey-env'

    process.env.CAH_KEY_NAME = cahKey

    await expect(getCAHKeyPath())
      .resolves.toBe(`${cahKeyDir}/${cahKey}.cahkey`)
  }
)

test(
  'should return path to cahkeys dir when present in env var',
  async () => {
    const mockKeysPath = '/env/path/to/cahkeys'

    process.env.CAH_KEYS_DIR = mockKeysPath

    await expect(getCAHKeyPath(cahKey))
      .resolves.toBe(`${mockKeysPath}/${cahKey}.cahkey`)
  }
)

test(
  'should return path to cahkeys dir when present in args',
  async () => {
    const mockKeysPath = '/args/path/to/cahkeys'

    process.env.CAH_KEYS_DIR = '/env/path/to/cahkeys'

    await expect(getCAHKeyPath(cahKey, { cahKeysDir: mockKeysPath }))
      .resolves.toBe(`${mockKeysPath}/${cahKey}.cahkey`)
  }
)

test(
  'should choose key if there is only one key in the keys dir (other than server)',
  async () => {
    await expect(getCAHKeyPath()).resolves.toBe(`${cahKeyDir}/${dirKeyFileName}`)
  }
)

test(
  'should throw error when no cert dir is specified and more than 2 files are present in directory',
  async () => {
    fs.readdir.mockImplementation((path, callback) => {
      callback(null, [...mockDirList, 'extra.client.cahkey'])
    })

    await expect(getCAHKeyPath()).rejects.toThrowError()
  }
)

test(
  'should throw error when no cahkeys directory can be found',
  async () => {
    locateKeysDir.mockReturnValue(undefined)

    await expect(getCAHKeyPath())
      .rejects
      .toThrowError('cahkeys directory could not be found')
  }
)
