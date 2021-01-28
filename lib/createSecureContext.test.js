/* global test expect jest */

const createSecureContext = require('./createSecureContext')
const loadKey = require('./loadKey')
const tls = require('tls')

jest.mock('./getCAHKeyPath')
jest.mock('./loadKey')
jest.mock('tls')

const mockLoadKey = {
  ca: 'mockCa',
  cert: 'mockCert',
  key: 'mockKey'
}

const mockOptions = {
  test1: 'testOption1',
  foo2: 'testOption2'
}

loadKey.mockReturnValue(Promise.resolve(mockLoadKey))

test(
  'should pass options through to tls.createSecureConnect()',
  async () => {
    await createSecureContext(mockOptions)

    expect(tls.createSecureContext).toBeCalledWith({
      ...mockOptions,
      ...mockLoadKey
    })
  }
)

test(
  'should not allow key options to be overridden',
  async () => {
    await createSecureContext({
      ...mockOptions,
      ca: 'replacedCa',
      cert: 'replacedCert',
      key: 'replacedKey'
    })

    expect(tls.createSecureContext)
      .toBeCalledWith(expect.objectContaining(mockLoadKey))
  }
)

test(
  'should not require args to be provided',
  async () => {
    await createSecureContext()

    expect(tls.createSecureContext)
      .toBeCalledWith(expect.objectContaining(mockLoadKey))
  }
)
