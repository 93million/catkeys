/* global jest beforeEach test expect */

const loadKey = require('./loadKey')
const tar = require('tar-stream')
const fs = require('fs')
const zlib = require('zlib')

jest.mock('fs')

const mockCaFile = 'test ca cert content'
const mockCertFile = 'test cert contents'
const mockCrlFile = 'mock CRL content'
const mockKeyFile = 'test key contents'
const tmpDir = '/test/tmp/dir'
const testKeyObj = {
  ca: Buffer.from(mockCaFile),
  cert: Buffer.from(mockCertFile),
  key: Buffer.from(mockKeyFile)
}
let mockKey

beforeEach(() => {
  mockKey = tar.pack()

  mockKey.entry({ name: 'ca-crt.pem' }, mockCaFile)
  mockKey.entry({ name: 'crt.pem' }, mockCertFile)
  mockKey.entry({ name: 'key.pem' }, mockKeyFile)
  mockKey.finalize()
})

fs.mkdtemp.mockImplementation((prefix, callback) => {
  callback(null, tmpDir)
})

fs.createReadStream.mockImplementation(() => mockKey.pipe(zlib.createGzip()))

test(
  'should return an object representing key',
  async () => {
    await expect(loadKey()).resolves.toEqual(testKeyObj)
  }
)

test(
  'should include crl if present',
  async () => {
    mockKey = tar.pack()
    mockKey.entry({ name: 'ca-crt.pem' }, mockCaFile)
    mockKey.entry({ name: 'ca-crl.pem' }, mockCrlFile)
    mockKey.entry({ name: 'crt.pem' }, mockCertFile)
    mockKey.entry({ name: 'key.pem' }, mockKeyFile)
    mockKey.finalize()

    await expect(loadKey())
      .resolves
      .toHaveProperty('crl', Buffer.from(mockCrlFile))
  }
)

test(
  'should not include crl if not present',
  async () => {
    await expect(loadKey()).resolves.not.toHaveProperty('crl')
  }
)
