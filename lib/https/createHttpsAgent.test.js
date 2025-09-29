/* global expect jest test  */

const https = require('https')
const createHttpsAgent = require('./createHttpsAgent')
const createSecureContext = require('../createSecureContext')
const checkServerIdentity = require('../checkServerIdentity')

jest.mock('https')
jest.mock('../checkServerIdentity')
jest.mock('../createSecureContext')

const mockSecureContext = { ca: 'cadata', key: 'keydata', cert: 'certdata' }
const mockHost = 'mockhost.name'
const mockPort = 1337

https.Agent.mockImplementation(({ checkServerIdentity }) => {
  checkServerIdentity(mockHost, mockPort)
})

createSecureContext.mockReturnValue(Promise.resolve(mockSecureContext))

test(
  'should pass catRejectMismatchedHostname to checkServerIdentity()',
  async () => {
    const catRejectMismatchedHostname = 'testcatRejectMismatchedHostnameValue'

    await createHttpsAgent({ catRejectMismatchedHostname })

    expect(checkServerIdentity)
      .toHaveBeenCalledWith(mockHost, mockPort, { catRejectMismatchedHostname })
  }
)

test(
  'should pass all received options to createSecureContext()',
  async () => {
    const options = { random: 'option', foo: 'bar' }

    await createHttpsAgent(options)

    expect(createSecureContext).toHaveBeenCalledWith(options)
  }
)

test(
  'should run without passing options arg',
  async () => {
    await createHttpsAgent()

    expect(createSecureContext).toHaveBeenCalledWith({})
    expect(https.Agent).toHaveBeenCalledWith({
      checkServerIdentity: expect.any(Function),
      secureContext: mockSecureContext
    })
  }
)
