/* global expect jest test  */

const connect = require('./connect')
const tls = require('tls')
const checkServerIdentity = require('../checkServerIdentity')
const createSecureContext = require('../createSecureContext')

jest.mock('https')
jest.mock('tls')
jest.mock('../checkServerIdentity')
jest.mock('../createSecureContext')

const mockSecureContext = { ca: 'cadata', key: 'keydata', cert: 'certdata' }

createSecureContext.mockReturnValue(Promise.resolve(mockSecureContext))

const url = 'https://www.example.com/test?url=true'
const opts = { method: 'POST' }
const callback = () => { }

test(
  'should wrap tls.connect with url as only arg',
  async () => {
    await connect(url)

    expect(tls.connect).toHaveBeenCalledWith(
      url,
      {
        secureContext: mockSecureContext,
        checkServerIdentity: expect.any(Function)
      }
    )
  }
)
test(
  'should wrap tls.connect with options as only arg',
  async () => {
    await connect(opts)

    expect(tls.connect).toHaveBeenCalledWith(
      {
        secureContext: mockSecureContext,
        checkServerIdentity: expect.any(Function),
        ...opts
      }
    )
  }
)
test(
  'should wrap tls.connect with url and options args',
  async () => {
    await connect(url, opts)

    expect(tls.connect).toHaveBeenCalledWith(
      url,
      {
        secureContext: mockSecureContext,
        checkServerIdentity: expect.any(Function),
        ...opts
      }
    )
  }
)
test(
  'should wrap tls.connect with url and callback args',
  async () => {
    await connect(url, callback)

    expect(tls.connect).toHaveBeenCalledWith(
      url,
      {
        secureContext: mockSecureContext,
        checkServerIdentity: expect.any(Function)
      },
      callback
    )
  }
)
test(
  'should wrap tls.connect with options and callback args',
  async () => {
    await connect(opts, callback)

    expect(tls.connect).toHaveBeenCalledWith(
      {
        secureContext: mockSecureContext,
        checkServerIdentity: expect.any(Function),
        ...opts
      },
      callback
    )
  }
)
test(
  'should wrap tls.connect with url, options and callback args',
  async () => {
    await connect(url, opts, callback)

    expect(tls.connect).toHaveBeenCalledWith(
      url,
      {
        secureContext: mockSecureContext,
        checkServerIdentity: expect.any(Function),
        ...opts
      },
      callback
    )
  }
)

test(
  'it should pass catRejectMismatchedHostname to checkServerIdentity()',
  async () => {
    tls.connect.mockImplementationOnce((_, { checkServerIdentity }) => {
      checkServerIdentity('localhost', {})
    })

    await connect(
      url,
      { ...opts, catRejectMismatchedHostname: true },
      callback
    )

    expect(checkServerIdentity).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      { catRejectMismatchedHostname: true }
    )
  }
)
