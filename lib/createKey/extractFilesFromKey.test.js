/* global jest beforeEach test expect */

const extractFilesFromKey = require('./extractFilesFromKey')
const tarStream = require('tar-stream')
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')
const { Writable, Readable } = require('stream')

jest.mock('fs')

const mockKeyPath = '/path/to/catkey'
const mockOutputDir = '/path/to/output/dir'
const mockCaFile = 'test ca cert content'
const mockCertFile = 'test cert contents'
const mockKeyFile = 'test key contents'
let writtenFiles

fs.createReadStream.mockImplementation(() => {
  const gzip = zlib.createGzip()
  const mockKey = tarStream.pack()

  mockKey.entry({ name: 'ca-crt.pem' }, mockCaFile)
  mockKey.entry({ name: 'crt.pem' }, mockCertFile)
  mockKey.entry({ name: 'key.pem' }, mockKeyFile)
  mockKey.finalize()

  return mockKey.pipe(gzip)
})

fs.createWriteStream.mockImplementation((path) => {
  const chunks = []
  const writeStream = new Writable({
    write: (chunk, encoding, callback) => {
      chunks.push(chunk)
      callback()
    }
  })

  writeStream.on('finish', () => {
    writtenFiles[path] = chunks.join('')
  })

  return writeStream
})

beforeEach(() => {
  writtenFiles = {}
})

test(
  'should write files in archive to disk',
  async () => {
    await extractFilesFromKey(mockKeyPath, mockOutputDir)

    const expected = {
      [path.resolve(mockOutputDir, 'ca-crt.pem')]: mockCaFile,
      [path.resolve(mockOutputDir, 'crt.pem')]: mockCertFile,
      [path.resolve(mockOutputDir, 'key.pem')]: mockKeyFile
    }

    expect(writtenFiles).toEqual(expected)
  }
)

test(
  'should exclude files present in exclude array',
  async () => {
    await extractFilesFromKey(
      mockKeyPath,
      mockOutputDir,
      { exclude: ['crt.pem'] }
    )

    const expected = {
      [path.resolve(mockOutputDir, 'ca-crt.pem')]: mockCaFile,
      [path.resolve(mockOutputDir, 'key.pem')]: mockKeyFile
    }

    expect(writtenFiles).toEqual(expected)
  }
)

test(
  'should include files present in include array',
  async () => {
    await extractFilesFromKey(
      mockKeyPath,
      mockOutputDir,
      { include: ['crt.pem', 'ca-crt.pem'] }
    )

    const expected = {
      [path.resolve(mockOutputDir, 'ca-crt.pem')]: mockCaFile,
      [path.resolve(mockOutputDir, 'crt.pem')]: mockCertFile
    }

    expect(writtenFiles).toEqual(expected)
  }
)

test(
  'should exclude files present in both exclude and include array ',
  async () => {
    await extractFilesFromKey(
      mockKeyPath,
      mockOutputDir,
      { include: ['crt.pem', 'ca-crt.pem'], exclude: ['crt.pem'] }
    )

    const expected = {
      [path.resolve(mockOutputDir, 'ca-crt.pem')]: mockCaFile
    }

    expect(writtenFiles).toEqual(expected)
  }
)

test(
  'should reject when errors are encountered gunzipping archive',
  async () => {
    fs.createReadStream.mockImplementationOnce(() => {
      const readable = new Readable({ read: () => {} })

      readable.push('invalid gzip')
      readable.push(null)

      return readable
    })

    await expect(extractFilesFromKey(mockKeyPath, mockOutputDir))
      .rejects
      .toThrow('incorrect header check')
  }
)

test(
  'should reject when errors are encountered extracting archive',
  async () => {
    fs.createReadStream.mockImplementationOnce(() => {
      const readable = new Readable({ read: () => { } })
      const gzip = zlib.createGzip()

      readable.push('invalid tar archive')
      readable.push(null)

      return readable.pipe(gzip)
    })

    await expect(extractFilesFromKey(mockKeyPath, mockOutputDir))
      .rejects
      .toThrow('Unexpected end of data')
  }
)
