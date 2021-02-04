/* global expect jest test  */

const request = require('./request')
const https = require('https')
const checkServerIdentity = require('../checkServerIdentity')
const createSecureContext = require('../createSecureContext')

jest.mock('https')
jest.mock('../checkServerIdentity')
jest.mock('../createSecureContext')

const mockSecureContext = { ca: 'cadata', key: 'keydata', cert: 'certdata' }

createSecureContext.mockReturnValue(Promise.resolve(mockSecureContext))

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
      { secureContext: mockSecureContext, agent: expect.any(https.Agent) }
    )
  }
)
test(
  'should wrap https.request with options as only arg',
  async () => {
    await request(opts)

    expect(https.request).toBeCalledWith(
      {
        secureContext: mockSecureContext,
        agent: expect.any(https.Agent),
        ...opts
      }
    )
  }
)
test(
  'should wrap https.request with url and options args',
  async () => {
    await request(url, opts)

    expect(https.request).toBeCalledWith(
      url,
      {
        secureContext: mockSecureContext,
        agent: expect.any(https.Agent),
        ...opts
      }
    )
  }
)
test(
  'should wrap https.request with url and callback args',
  async () => {
    await request(url, callback)

    expect(https.request).toBeCalledWith(
      url,
      { secureContext: mockSecureContext, agent: expect.any(https.Agent) },
      callback
    )
  }
)
test(
  'should wrap https.request with options and callback args',
  async () => {
    await request(opts, callback)

    expect(https.request).toBeCalledWith(
      {
        secureContext: mockSecureContext,
        agent: expect.any(https.Agent),
        ...opts
      },
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
      {
        secureContext: mockSecureContext,
        agent: expect.any(https.Agent),
        ...opts
      },
      callback
    )
  }
)

test(
  'it should pass catIgnoreMismatchedHostName to checkServerIdentity()',
  async () => {
    https.Agent.mockImplementationOnce(({ checkServerIdentity }) => {
      checkServerIdentity('localhost', {})
    })

    await request(
      url,
      { ...opts, catIgnoreMismatchedHostName: true },
      callback
    )

    expect(checkServerIdentity).toBeCalledWith(
      expect.any(String),
      expect.any(Object),
      { catIgnoreMismatchedHostName: true }
    )
  }
)
