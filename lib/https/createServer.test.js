/* global beforeEach expect jest test  */

const createServer = require('./createServer')
const https = require('https')
const loadKey = require('../loadKey')
const getCatKeyPath = require('../getCatKeyPath')
const { Readable, Writable } = require('stream')
const catkeyIsPresent = require('../catkeyIsPresent')

const opts = { port: 1234, catKeysDir: '/path/to/catkeys' }
const { catKeysDir, ...optsFiltered } = opts
const handler = jest.fn()

jest.mock('https')
jest.mock('../loadKey')
jest.mock('../getCatKeyPath')
jest.mock('../checkServerIdentity')
jest.mock('../catkeyIsPresent')

const mockLoadKeyObj = {
  ca: '/path/test/ca-crt.pem',
  cert: '/path/test/crt.pem',
  key: '/path/test/key.pem'
}

loadKey.mockReturnValue(Promise.resolve(mockLoadKeyObj))

let chunks
const writeHead = jest.fn()
let req
let res

https.createServer.mockImplementation((options, handler) => {
  handler(req, res)
})

beforeEach(() => {
  chunks = []
  req = new Readable()
  res = new Writable({ write: (chunk) => { chunks.push(chunk) } })
  req.connection = { getPeerCertificate: jest.fn() }
  res.writeHead = writeHead
})

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
  'should wrap https createServer with both request handler callback and request options objects',
  async () => {
    await createServer(opts, handler)

    expect(https.createServer).toBeCalledWith(
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
  'should call getCatKeyPath with catKeysDir when present',
  async () => {
    await createServer(opts, handler)

    expect(getCatKeyPath)
      .toBeCalledWith('server', { catKeysDir: opts.catKeysDir })
  }
)

test(
  // eslint-disable-next-line max-len
  'should reject requests when catkey doesn\'t exist when `catCheckKeyExists: true`',
  async () => {
    catkeyIsPresent.mockReturnValueOnce(Promise.resolve(false))

    await createServer({ ...opts, catCheckKeyExists: true }, handler)

    expect(writeHead).toBeCalledWith(403, 'Forbidden')
    expect(chunks.join('')).toBe('catkey not present on disk')
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
