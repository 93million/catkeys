/* global jest test expect */

const createTLSCa = require('./createTLSCa')
const childProcess = require('child_process')
const path = require('path')

jest.mock('child_process')

const mockKeydir = '/path/to/keydir'

childProcess.execFile.mockImplementation((script, args, callback) => {
  callback(null)
})

test(
  'should output key and cert to keydir',
  async () => {
    await createTLSCa(mockKeydir)

    expect(childProcess.execFile).toBeCalledWith(
      'openssl',
      expect.arrayContaining([
        path.resolve(mockKeydir, 'ca-crt.pem'),
        path.resolve(mockKeydir, 'ca-key.pem')
      ]),
      expect.any(Function)
    )
  }
)
