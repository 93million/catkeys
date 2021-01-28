/* global jest test expect beforeEach */

const getCatKeyPath = require('./getCatKeyPath')
const locateKeysDir = require('./locateKeysDir')
const fs = require('fs')

const catKey = 'testkey'
const dirKeyFileName = 'testclient.catkey'
const catKeyDir = '/test/catkeys/dir'
const mockDirList = ['server.catkey', dirKeyFileName]

jest.mock('./locateKeysDir')
jest.mock('fs')

beforeEach(() => {
  locateKeysDir.mockReset()
  locateKeysDir.mockReturnValue(Promise.resolve(catKeyDir))
  delete process.env.CAT_KEY_NAME
  delete process.env.CAT_KEYS_DIR
  fs.readdir.mockImplementation((path, callback) => {
    callback(null, mockDirList)
  })
})

test(
  'should return path to key when supplied as argument',
  async () => {
    await expect(getCatKeyPath(catKey))
      .resolves.toBe(`${catKeyDir}/${catKey}.catkey`)
  }
)

test(
  'should return path to key when key name present in env var',
  async () => {
    const catKey = 'testkey-env'

    process.env.CAT_KEY_NAME = catKey

    await expect(getCatKeyPath())
      .resolves.toBe(`${catKeyDir}/${catKey}.catkey`)
  }
)

test(
  'should return path to catkeys dir when present in env var',
  async () => {
    const mockKeysPath = '/env/path/to/catkeys'

    process.env.CAT_KEYS_DIR = mockKeysPath

    await expect(getCatKeyPath(catKey))
      .resolves.toBe(`${mockKeysPath}/${catKey}.catkey`)
  }
)

test(
  'should return path to catkeys dir when present in args',
  async () => {
    const mockKeysPath = '/args/path/to/catkeys'

    process.env.CAT_KEYS_DIR = '/env/path/to/catkeys'

    await expect(getCatKeyPath(catKey, { catKeysDir: mockKeysPath }))
      .resolves.toBe(`${mockKeysPath}/${catKey}.catkey`)
  }
)

test(
  // eslint-disable-next-line max-len
  'should choose key if there is only one key in the keys dir (other than server)',
  async () => {
    await expect(getCatKeyPath())
      .resolves
      .toBe(`${catKeyDir}/${dirKeyFileName}`)
  }
)

test(
  // eslint-disable-next-line max-len
  'should throw error when no cert dir is specified and more than 2 files are present in directory',
  async () => {
    fs.readdir.mockImplementation((path, callback) => {
      callback(null, [...mockDirList, 'extra.client.catkey'])
    })

    await expect(getCatKeyPath()).rejects.toThrowError()
  }
)

test(
  'should throw error when no catkeys directory can be found',
  async () => {
    locateKeysDir.mockReturnValue(undefined)

    await expect(getCatKeyPath())
      .rejects
      .toThrowError('catkeys directory could not be found')
  }
)
