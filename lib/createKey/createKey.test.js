/* global jest test expect */

const createKey = require('./createKey')
const path = require('path')
const fs = require('fs')
const createTLSCa = require('./createTLSCa')
const createTLSKey = require('./createTLSKey')
const createTLSCert = require('./createTLSCert')
const createKeyArchiveStreamFromDir = require('./createKeyArchiveStreamFromDir')
const writeStream = require('../writeStream')
const extractFilesFromKey = require('./extractFilesFromKey')
const fileExists = require('../fileExists')
const updateKeyArchiveStream = require('./updateKeyArchiveStream')
const config = require('../../config')

jest.mock('fs')
jest.mock('./createTLSCa')
jest.mock('./createTLSKey')
jest.mock('./createTLSCert')
jest.mock('./createKeyArchiveStreamFromDir')
jest.mock('../writeStream')
jest.mock('./extractFilesFromKey')
jest.mock('../fileExists')
jest.mock('./updateKeyArchiveStream')

const mockKeydir = '/path/to/key/dir'

fileExists.mockReturnValue(Promise.resolve(true))
createTLSCa.mockReturnValue(Promise.resolve())
createTLSKey.mockReturnValue(Promise.resolve())
createTLSCert.mockReturnValue(Promise.resolve())
writeStream.mockReturnValue(Promise.resolve())
extractFilesFromKey.mockReturnValue(Promise.resolve())
updateKeyArchiveStream.mockReturnValue(Promise.resolve())
createKeyArchiveStreamFromDir.mockReturnValue(Promise.resolve())
fs.mkdir.mockImplementation((path, callback) => { callback(null) })
fs.readFile.mockImplementation((path, callback) => { callback(null) })
fs.unlink.mockImplementation((path, callback) => { callback(null) })

test(
  'should refuse to create client key with invalid name',
  async () => {
    await expect(createKey({
      server: false,
      commonName: config.client.invalidCommonNames[0]
    }))
      .rejects
      .toThrow('Client keys cannot')
  }
)

test(
  'should create key dir if it doesn\'t exist',
  async () => {
    fileExists.mockReturnValueOnce(Promise.resolve(false))
    await createKey({ keydir: mockKeydir })
    expect(fs.mkdir).toBeCalledWith(mockKeydir, expect.any(Function))
  }
)

test(
  'should create CA when creating server keys',
  async () => {
    await createKey({ server: true, keydir: mockKeydir })
    expect(createTLSCa).toBeCalledTimes(1)
  }
)

test(
  'should not create CA when updating server keys',
  async () => {
    await createKey({ server: true, updateServer: true, keydir: mockKeydir })
    expect(createTLSCa).not.toBeCalled()
  }
)

test(
  'should use correct filename for server keys',
  async () => {
    await createKey({ keydir: mockKeydir, server: true, commonName: 'foo' })

    expect(writeStream).toBeCalledWith(
      undefined,
      path.resolve(mockKeydir, 'server.catkey')

    )
  }
)

test(
  'should use correct filename for client keys',
  async () => {
    await createKey({ keydir: mockKeydir, server: false, commonName: 'foo' })

    expect(writeStream).toBeCalledWith(
      undefined,
      path.resolve(mockKeydir, 'foo.catkey')
    )
  }
)

test(
  'should update server key serial when creating client keys',
  async () => {
    await createKey({ keydir: mockKeydir, server: false, commonName: 'foo' })

    expect(updateKeyArchiveStream).toBeCalledWith(
      undefined,
      { '.srl': undefined }
    )
  }
)

test(
  'should remove files in key directory after successfully generating key',
  async () => {
    await createKey({ keydir: mockKeydir, server: false, commonName: 'foo' })

    expect(fs.unlink).toBeCalledWith(
      path.resolve(mockKeydir, 'ca-crt.pem'),
      expect.any(Function)
    )
    expect(fs.unlink).toBeCalledWith(
      path.resolve(mockKeydir, '.srl'),
      expect.any(Function)
    )
  }
)

test(
  'should remove files in key directory after failing to generate key',
  async () => {
    createTLSKey.mockImplementationOnce(() => { throw new Error('CHUNDER!') })

    try {
      await createKey({ keydir: mockKeydir })
    } catch (e) {}

    expect(fs.unlink).toBeCalledWith(
      path.resolve(mockKeydir, 'ca-crt.pem'),
      expect.any(Function)
    )
    expect(fs.unlink).toBeCalledWith(
      path.resolve(mockKeydir, '.srl'),
      expect.any(Function)
    )
  }
)
