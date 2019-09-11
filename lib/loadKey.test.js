/* global jest test expect */

const loadKey = require('./loadKey')
const tar = require('tar-stream')
const fs = require('fs')
const zlib = require('zlib')

jest.mock('fs')

const gzip = zlib.createGzip()
const mockCaFile = 'test ca cert content'
const mockCertFile = 'test cert contents'
const mockKeyFile = 'test key contents'
const tmpDir = '/test/tmp/dir'
const testKeyObj = {
  ca: Buffer.from(mockCaFile),
  cert: Buffer.from(mockCertFile),
  key: Buffer.from(mockKeyFile)
}
const mockKey = tar.pack()
mockKey.entry({ name: 'ca-crt.pem' }, mockCaFile)
mockKey.entry({ name: 'crt.pem' }, mockCertFile)
mockKey.entry({ name: 'key.pem' }, mockKeyFile)
mockKey.finalize()

fs.mkdtemp.mockImplementation((prefix, callback) => {
  callback(null, tmpDir)
})

fs.createReadStream.mockReturnValue(mockKey.pipe(gzip))

test(
  'returns an object representing key',
  async () => {
    const keyObj = await loadKey()

    expect(keyObj).toEqual(testKeyObj)
  }
)
