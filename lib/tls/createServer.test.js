/* global beforeEach expect jest test  */

const createServer = require('./createServer')
const tls = require('tls')
const loadKey = require('../loadKey')
const getCAHKeyPath = require('../getCAHKeyPath')
const { Writable } = require('stream')
const cahkeyIsPresent = require('../cahkeyIsPresent')

const opts = { port: 1234, cahKeysDir: '/path/to/cahkeys' }
const { cahKeysDir, ...optsFiltered } = opts
const handler = jest.fn()

jest.mock('tls')
jest.mock('../loadKey')
jest.mock('../getCAHKeyPath')
jest.mock('../checkServerIdentity')
jest.mock('../cahkeyIsPresent')

const mockLoadKeyObj = {
  ca: '/path/test/ca-crt.pem',
  cert: '/path/test/crt.pem',
  key: '/path/test/key.pem'
}

loadKey.mockReturnValue(Promise.resolve(mockLoadKeyObj))

let chunks
let socket

tls.createServer.mockImplementation((options, handler) => {
  handler(socket)
})

beforeEach(() => {
  chunks = []
  socket = new Writable({ write: (chunk) => { chunks.push(chunk) } })
  socket.connection = { getPeerCertificate: jest.fn() }
})

test(
  'should wrap tls createServer with handler callback as only arg',
  async () => {
    await createServer(handler)

    expect(tls.createServer).toBeCalledWith(
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
  'should wrap tls createServer with request options object as only arg',
  async () => {
    await createServer(opts)

    expect(tls.createServer).toBeCalledWith(
      {
        ...optsFiltered,
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
  'should wrap tls createServer with both request handler callback and request options objects',
  async () => {
    await createServer(opts, handler)

    expect(tls.createServer).toBeCalledWith(
      {
        ...optsFiltered,
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
    cahkeyIsPresent.mockReturnValueOnce(Promise.resolve(false))

    await createServer({ ...opts, cahCheckKeyExists: true }, handler)

    expect(chunks.join('')).toBe('cahkey not present on disk')
  }
)

test(
  'should only call requestHandler arg if provided',
  async () => {
    await createServer(opts)
    expect(handler).toBeCalledTimes(0)

    await createServer(opts, handler)
    expect(handler).toBeCalledTimes(1)
  }
)
