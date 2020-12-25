/* global expect jest test  */

const createServer = require('./createServer')
const https = require('https')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')

const opts = { port: 1234, cahKeysDir: '/path/to/cahkeys' }
const handler = () => { }

jest.mock('https')
jest.mock('./loadKey')
jest.mock('./getCAHKeyPath')
jest.mock('./checkServerIdentity')

const mockLoadKeyObj = {
  ca: '/path/test/ca-crt.pem',
  cert: '/path/test/crt.pem',
  key: '/path/test/key.pem'
}

loadKey.mockReturnValue(Promise.resolve(mockLoadKeyObj))

test(
  'should wrap https createServer with handler callback as only arg',
  async () => {
    await createServer(handler)

    expect(https.createServer).toBeCalledWith(
      {
        ...mockLoadKeyObj,
        requestCert: true,
        rejectUnauthorized: true
      },
      handler
    )
  }
)

test(
  'should wrap https createServer with request options object as only arg',
  async () => {
    await createServer(opts)

    expect(https.createServer).toBeCalledWith(
      {
        ...opts,
        ...mockLoadKeyObj,
        requestCert: true,
        rejectUnauthorized: true
      },
      undefined
    )
  }
)

test(
  // eslint-disable-next-line max-len
  'should wrap https createServer with both request handler callback and request options objects',
  async () => {
    await createServer(opts, handler)

    expect(https.createServer).toBeCalledWith(
      {
        ...opts,
        ...mockLoadKeyObj,
        requestCert: true,
        rejectUnauthorized: true
      },
      handler
    )
  }
)

test(
  'should call getCAHKeyPath with cahKeysDir when present',
  async () => {
    await createServer(opts, handler)

    expect(getCAHKeyPath)
      .toBeCalledWith('server', { cahKeysDir: opts.cahKeysDir })
  }
)
