/* global jest test expect */

const createKeyArchiveStreamFromDir = require('./createKeyArchiveStreamFromDir')
const fs = require('fs')
const tar = require('tar-stream')

jest.mock('fs')
jest.mock('tar-stream')
jest.mock('zlib')

const mockPack = {
  entry: jest.fn(),
  finalize: jest.fn(),
  pipe: jest.fn()
}

mockPack.entry.mockImplementation((options, callback) => {
  callback(undefined)
})

tar.pack.mockReturnValue(mockPack)
fs.stat.mockImplementation((filePath, callback) => {
  callback(null, {})
})

const clientKeyFilenames = ['ca-crt.pem', 'crt.pem', 'key.pem']
const serverKeyFilenames = [...clientKeyFilenames, 'ca-key.pem', '.srl']
const mockKeydir = '/path/to/key/dir'

test(
  'Should include required files in client keys',
  async () => {
    await createKeyArchiveStreamFromDir(mockKeydir)

    expect(mockPack.entry).toBeCalledTimes(clientKeyFilenames.length)

    clientKeyFilenames.forEach((filename) => {
      expect(mockPack.entry).toBeCalledWith(
        { name: filename },
        expect.any(Function)
      )
    })
  }
)

test(
  'Should include required files in server keys',
  async () => {
    await createKeyArchiveStreamFromDir(mockKeydir, { server: true })

    expect(mockPack.entry).toBeCalledTimes(serverKeyFilenames.length)

    serverKeyFilenames.forEach((filename) => {
      expect(mockPack.entry).toBeCalledWith(
        { name: filename },
        expect.any(Function)
      )
    })
  }
)

test(
  'should reject with errors encountered during pack',
  async () => {
    mockPack.entry.mockImplementationOnce((options, callback) => {
      callback(new Error('whoops!'))
    })

    await expect(createKeyArchiveStreamFromDir(mockKeydir))
      .rejects
      .toThrow('whoops!')
  }
)
