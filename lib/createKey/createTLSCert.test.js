/* global jest test expect */

const createTLSCert = require('./createTLSCert')
const path = require('path')
const childProcess = require('child_process')
const fs = require('fs')

jest.mock('child_process')
jest.mock('fs')

childProcess
  .execFile
  .mockImplementation((script, args, callback) => { callback(null) })

fs.unlink.mockImplementation((path, callback) => { callback(null) })

const mockCommonName = 'mock-common-name'
const mockKeydir = '/path/to/keydir'

test(
  'should pass common name to openssl',
  async () => {
    await createTLSCert(mockCommonName, mockKeydir)

    expect(childProcess.execFile).toBeCalledWith(
      'openssl',
      expect.arrayContaining([
        expect.stringContaining(`/CN=${mockCommonName}`)
      ]),
      expect.any(Function)
    )
  }
)

test(
  'should server extension to openssl for server keys',
  async () => {
    await createTLSCert(mockCommonName, mockKeydir, true)

    expect(childProcess.execFile).toBeCalledWith(
      'openssl',
      expect.arrayContaining(['-extensions', 'server']),
      expect.any(Function)
    )
  }
)

test(
  'should output key and cert to keydir',
  async () => {
    await createTLSCert(mockCommonName, mockKeydir)

    expect(childProcess.execFile).toBeCalledWith(
      'openssl',
      expect.arrayContaining([
        path.resolve(mockKeydir, 'key.pem'),
        path.resolve(mockKeydir, 'csr.pem')
      ]),
      expect.any(Function)
    )
  }
)

test(
  'should delete cert signing request after generating certificate',
  async () => {
    await createTLSCert(mockCommonName, mockKeydir)

    expect(fs.unlink).toBeCalledWith(
      path.resolve(mockKeydir, 'csr.pem'),
      expect.any(Function)
    )
  }
)
