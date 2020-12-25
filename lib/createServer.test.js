/* global expect jest test  */

const createServer = require('./createServer')
const https = require('https')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')
const { Readable, Writable } = require('stream')
const cahkeyIsPresent = require('./cahkeyIsPresent')

const opts = { port: 1234, cahKeysDir: '/path/to/cahkeys' }
const handler = () => { }

jest.mock('https')
jest.mock('./loadKey')
jest.mock('./getCAHKeyPath')
jest.mock('./checkServerIdentity')
jest.mock('./cahkeyIsPresent')

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
      expect.any(Function)
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
      expect.any(Function)
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
      expect.any(Function)
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

test(
  // eslint-disable-next-line max-len
  'should reject requests when cahkey doesn\'t exist when `cahCheckKeyExists: true`',
  async () => {
    const chunks = []
    const writeHead = jest.fn()
    const req = new Readable()

    req.connection = { getPeerCertificate: jest.fn() }

    const res = new Writable({ write: (chunk) => { chunks.push(chunk) } })

    res.writeHead = writeHead

    cahkeyIsPresent.mockReturnValueOnce(Promise.resolve(false))

    https.createServer.mockImplementationOnce((options, handler) => {
      handler(req, res)
    })
    await createServer({ ...opts, cahCheckKeyExists: true }, handler)

    expect(writeHead).toBeCalledWith(403, 'Forbidden')
    expect(chunks.join('')).toBe('cahkey not present on disk')
  }
)
