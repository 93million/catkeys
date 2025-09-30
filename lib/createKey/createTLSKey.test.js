/* global jest test expect */

const createTLSKey = require('./createTLSKey')
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
    await createTLSKey(mockKeydir)

    expect(childProcess.execFile).toHaveBeenCalledWith(
      'openssl',
      expect.arrayContaining([
        path.resolve(mockKeydir, 'key.pem')
      ]),
      expect.any(Function)
    )
  }
)
