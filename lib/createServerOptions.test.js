/* global test expect jest */

const createServerOptions = require('./createServerOptions')
const loadKey = require('./loadKey')

jest.mock('./getCatKeyPath')
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
  'should return an object containing options args',
  async () => {
    await expect(createServerOptions(mockOptions)).resolves.toEqual({
      ...mockOptions,
      ...mockLoadKey,
      requestCert: true,
      rejectUnauthorized: true
    })
  }
)

test(
  'should not allow key options to be overridden',
  async () => {
    await expect(createServerOptions(
      {
        ...mockOptions,
        ca: 'replacedCa',
        cert: 'replacedCert',
        key: 'replacedKey'
      }
    ))
      .resolves
      .toEqual(expect.objectContaining(mockLoadKey))
  }
)

test(
  'should not require args to be provided',
  async () => {
    await expect(createServerOptions()).resolves.toEqual({
      ...mockLoadKey,
      requestCert: true,
      rejectUnauthorized: true
    })
  }
)
