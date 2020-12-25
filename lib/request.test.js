/* global expect jest test  */

const request = require('./request')
const https = require('https')
const loadKey = require('./loadKey')
const getCAHKeyPath = require('./getCAHKeyPath')
const checkServerIdentity = require('./checkServerIdentity')

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

const url = 'https://www.example.com/test?url=true'
const opts = { method: 'POST' }
const callback = () => { }

https.request.mockImplementation = () => { }

test(
  'should wrap https.request with url as only arg',
  async () => {
    await request(url)

    expect(https.request).toBeCalledWith(
      url,
      { ...mockLoadKeyObj, agent: expect.any(https.Agent) },
      undefined
    )
  }
)
test(
  'should wrap https.request with options as only arg',
  async () => {
    await request(opts)

    expect(https.request).toBeCalledWith(
      { ...mockLoadKeyObj, agent: expect.any(https.Agent), ...opts },
      undefined
    )
  }
)
test(
  'should wrap https.request with url and options args',
  async () => {
    await request(url, opts)

    expect(https.request).toBeCalledWith(
      url,
      { ...mockLoadKeyObj, agent: expect.any(https.Agent), ...opts },
      undefined
    )
  }
)
test(
  'should wrap https.request with url and callback args',
  async () => {
    await request(url, callback)

    expect(https.request).toBeCalledWith(
      url,
      { ...mockLoadKeyObj, agent: expect.any(https.Agent) },
      callback
    )
  }
)
test(
  'should wrap https.request with options and callback args',
  async () => {
    await request(opts, callback)

    expect(https.request).toBeCalledWith(
      { ...mockLoadKeyObj, agent: expect.any(https.Agent), ...opts },
      callback
    )
  }
)
test(
  'should wrap https.request with url, options and callback args',
  async () => {
    await request(url, opts, callback)

    expect(https.request).toBeCalledWith(
      url,
      { ...mockLoadKeyObj, agent: expect.any(https.Agent), ...opts },
      callback
    )
  }
)

test(
  'should call getCAHKeyPath with cahKeysDir when present in opts',
  async () => {
    await request(url, opts, callback)

    expect(getCAHKeyPath)
      .toBeCalledWith(opts.cahKey, { cahKeysDir: opts.cahKeysDir })
  }
)

test(
  'it should pass cahIgnoreMismatchedHostName to checkServerIdentity()',
  async () => {
    https.Agent.mockImplementationOnce(({ checkServerIdentity }) => {
      checkServerIdentity('localhost', {})
    })

    await request(
      url,
      { ...opts, cahIgnoreMismatchedHostName: true },
      callback
    )

    expect(checkServerIdentity).toBeCalledWith(
      expect.any(String),
      expect.any(Object),
      { cahIgnoreMismatchedHostName: true }
    )
  }
)

test(
  'should allow https options to be overridden',
  async () => {
    await request({ foo: 123 }, callback, undefined, { foo: 321 })

    expect(https.request).toBeCalledWith(
      { agent: expect.any(https.Agent), ...mockLoadKeyObj, foo: 321 },
      callback
    )
  }
)
