/* global expect jest test  */

const createServer = require('./createServer')
const tls = require('tls')
const loadKey = require('../loadKey')
const getCatKeyPath = require('../getCatKeyPath')
const { Writable } = require('stream')
const catkeyIsPresent = require('../catkeyIsPresent')
const { EventEmitter } = require('events')

const opts = { port: 1234, catKeysDir: '/path/to/catkeys' }
const { catKeysDir, ...optsFiltered } = opts
const handler = jest.fn()

handler.mockImplementation((socket) => {
  socket.write('test msg')
  socket.end()
})

jest.mock('tls')
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

tls.createServer.mockImplementation(() => new EventEmitter())

const emitSecureConnection = (server) => new Promise((resolve, reject) => {
  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      stream._chunks.push(chunk)
      callback()
    }
  })

  const origEnd = stream.end

  stream.end = jest.fn()
  stream.end.mockImplementation(origEnd)

  stream._chunks = []
  stream.getPeerCertificate = getPeerCertificate
  stream.on('finish', () => {
    stream._written = Buffer.concat(stream._chunks)
    resolve(stream)
  })
  stream.on('error', reject)

  server.emit('secureConnection', stream)
})

test(
  'should wrap tls createServer with handler callback as only arg',
  async () => {
    await createServer(handler)

    expect(tls.createServer).toBeCalledWith({
      ...mockLoadKeyObj,
      requestCert: true,
      rejectUnauthorized: true
    })
  }
)

test(
  'should wrap tls createServer with request options object as only arg',
  async () => {
    await createServer(opts)

    expect(tls.createServer).toBeCalledWith({
      ...optsFiltered,
      ...mockLoadKeyObj,
      requestCert: true,
      rejectUnauthorized: true
    })
  }
)

test(
  // eslint-disable-next-line max-len
  'should wrap tls createServer with both request handler callback and request options objects',
  async () => {
    await createServer(opts, handler)

    expect(tls.createServer).toBeCalledWith({
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

    server.on('secureConnection', handler)

    const stream = await emitSecureConnection(server)

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

    await emitSecureConnection(server2)

    expect(handler).toBeCalledTimes(1)
  }
)
