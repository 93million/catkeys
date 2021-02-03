/* global expect jest test  */

const createServer = require('./createServer')
const https = require('https')
const loadKey = require('../loadKey')
const getCatKeyPath = require('../getCatKeyPath')
const { Writable, Readable } = require('stream')
const catkeyIsPresent = require('../catkeyIsPresent')
const { EventEmitter } = require('events')

const opts = { port: 1234, catKeysDir: '/path/to/catkeys' }
const { catKeysDir, ...optsFiltered } = opts
const handler = jest.fn()

handler.mockImplementation((req, res) => {
  res.write('test msg')
  res.end()
})

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

catkeyIsPresent.mockReturnValue(Promise.resolve(true))
loadKey.mockReturnValue(Promise.resolve(mockLoadKeyObj))

const getPeerCertificate = jest.fn()

https.createServer.mockImplementation(() => new EventEmitter())

const emitRequest = (server) => new Promise((resolve, reject) => {
  const req = new Readable()
  const res = new Writable({
    write: (chunk, encoding, callback) => {
      res._chunks.push(chunk)
      callback()
    }
  })

  req.connection = { getPeerCertificate }

  const origEnd = res.end.bind(res)

  res.end = jest.fn()
  res.end.mockImplementation(() => {
    res.finished = true
    origEnd()
  })
  res.writeHead = jest.fn()
  res.finished = false

  res._chunks = []
  res.on('finish', () => {
    res._written = Buffer.concat(res._chunks)
    resolve(res)
  })
  res.on('error', reject)

  server.emit('request', req, res)
})

test(
  'should wrap https createServer with handler callback as only arg',
  async () => {
    await createServer(handler)

    expect(https.createServer).toBeCalledWith({
      ...mockLoadKeyObj,
      requestCert: true,
      rejectUnauthorized: true
    })
  }
)

test(
  'should wrap https createServer with request options object as only arg',
  async () => {
    await createServer(opts)

    expect(https.createServer).toBeCalledWith({
      ...optsFiltered,
      ...mockLoadKeyObj,
      requestCert: true,
      rejectUnauthorized: true
    })
  }
)

test(
  // eslint-disable-next-line max-len
  'should wrap https createServer with both request handler callback and request options objects',
  async () => {
    await createServer(opts, handler)

    expect(https.createServer).toBeCalledWith({
      ...optsFiltered,
      ...mockLoadKeyObj,
      requestCert: true,
      rejectUnauthorized: true
    })
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
    catkeyIsPresent.mockReturnValueOnce(Promise.resolve(false))

    const server = await createServer(
      { ...opts, catCheckKeyExists: true },
      handler
    )

    server.on('request', handler)

    const stream = await emitRequest(server)

    expect(stream._written.toString()).toBe('catkey not present on disk')
    expect(stream.end).toBeCalledTimes(1)
  }
)

test(
  'should pass events to server',
  async () => {
    const server = await createServer(opts)
    const connectionHandler = jest.fn()

    server.on('connection', connectionHandler)
    server.emit('connection')

    expect(connectionHandler).toBeCalledTimes(1)
  }
)

test(
  'should only call requestHandler arg if provided',
  async () => {
    await createServer(opts)

    expect(handler).toBeCalledTimes(0)

    const server2 = await createServer(opts, handler)

    await emitRequest(server2)

    expect(handler).toBeCalledTimes(1)
  }
)
