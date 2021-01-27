/* global describe expect test */

const testClient = require('./lib/tls/testClient')

describe(
  'CAT TLS Client',
  () => {
    test(
      'should connect using a valid cahkey',
      async () => {
        await expect(testClient()).resolves.toBe('Hello from CAT')
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should connect using a valid cahkey to an mismatched hostname using `cahIgnoreMismatchedHostName: true`',
      async () => {
        await expect(testClient({
          cahIgnoreMismatchedHostName: true,
          host: '127.0.0.1'
        }))
          .resolves
          .toBe('Hello from CAT')
      }
    )
  }
)
