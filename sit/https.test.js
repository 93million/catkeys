/* global describe expect test */

const https = require('https')
const { testCahkeysDir2 } = require('./filepaths')
const testRequest = require('./lib/https/testRequest')

describe(
  'CAT HTTPS Server',
  () => {
    test(
      'should reject connections from https clients',
      async () => {
        const request = () => new Promise((resolve, reject) => {
          const req = https.request(
            {
              hostname: 'localhost',
              port: 45231,
              rejectUnauthorized: false
            },
            (res) => { resolve('connection established') }
          )

          req.on('error', reject)
          req.write('')
          req.end()
        })

        await expect(request()).rejects.toHaveProperty('code', 'ECONNRESET')
      }
    )

    test(
      'should reject connections from clients with an invalid cahkey',
      async () => {
        await expect(testRequest({
          cahKeysDir: testCahkeysDir2,
          rejectUnauthorized: false
        }))
          .rejects
          .toHaveProperty('code', 'ECONNRESET')
      }
    )
  }
)

describe(
  'CAT HTTPS Client',
  () => {
    test(
      'should connect using a valid cahkey',
      async () => {
        await expect(testRequest()).resolves.toBe(200)
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should connect using a valid cahkey to an mismatched hostname using `cahIgnoreMismatchedHostName: true`',
      async () => {
        await expect(testRequest({
          cahIgnoreMismatchedHostName: true,
          hostname: '127.0.0.1'
        }))
          .resolves
          .toBe(200)
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should refuse to connect to server when hostname doesn\'t match cert alt name',
      async () => {
        await expect(testRequest({ hostname: '127.0.0.1' }))
          .rejects
          .toHaveProperty('code', 'ERR_TLS_CERT_ALTNAME_INVALID')
      }
    )

    test(
      'should refuse to connect to HTTPS servers with self signed certs',
      async () => {
        await expect(testRequest({
          cahIgnoreMismatchedHostName: true,
          port: 45232
        }))
          .rejects
          .toHaveProperty('code', 'CERT_SIGNATURE_FAILURE')
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should refuse to connect to HTTPS servers with certs signed by supported CAs',
      async () => {
        await expect(testRequest({
          cahIgnoreMismatchedHostName: true,
          hostname: 'google.com',
          port: 443
        }))
          .rejects
          .toHaveProperty('code', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY')
      }
    )
  }
)
