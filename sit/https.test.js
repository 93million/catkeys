/* global describe expect test */

const https = require('https')
const {
  testCatkeysDir2,
  testLegacyCahkeysDir,
  testClientOnlyCatkeysDir
} = require('./filepaths')
const testRequest = require('./lib/https/testRequest')

describe(
  'CAT HTTPS Server',
  () => {
    test(
      'should reject connections from regular https clients',
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
      'should reject connections from clients with an invalid catkey',
      async () => {
        await expect(testRequest({
          catKeysDir: testCatkeysDir2,
          rejectUnauthorized: false
        }))
          .rejects
          .toHaveProperty('code', 'ECONNRESET')
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should reject clients with missing key with servers running with `catCheckKeyExists: true`',
      async () => {
        await expect(testRequest({
          catKeysDir: testClientOnlyCatkeysDir,
          rejectUnauthorized: false,
          port: 45230
        }))
          .resolves
          .toBe(403)
      }
    )
  }
)

describe(
  'CAT HTTPS Client',
  () => {
    test(
      'should connect using a valid catkey',
      async () => {
        await expect(testRequest()).resolves.toBe(200)
      }
    )

    test(
      'should connect to mismatched hostname',
      async () => {
        await expect(testRequest({ hostname: '127.0.0.1' }))
          .resolves
          .toBe(200)
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should refuse to connect to mismatched hostname when catIgnoreMismatchedHostName = false',
      async () => {
        await expect(testRequest({
          hostname: '127.0.0.1',
          catIgnoreMismatchedHostName: false
        }))
          .rejects
          .toHaveProperty('code', 'ERR_TLS_CERT_ALTNAME_INVALID')
      }
    )

    test(
      'should refuse to connect to servers with self signed certs',
      async () => {
        await expect(testRequest({
          catIgnoreMismatchedHostName: true,
          port: 45232
        }))
          .rejects
          .toHaveProperty('code', 'CERT_SIGNATURE_FAILURE')
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should refuse to connect to servers with certs signed by supported CAs',
      async () => {
        await expect(testRequest({
          catIgnoreMismatchedHostName: true,
          hostname: 'google.com',
          port: 443
        }))
          .rejects
          .toHaveProperty('code', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY')
      }
    )

    test(
      'should connect using a valid catkey with a legacy cahkeys extension',
      async () => {
        await expect(testRequest({
          port: 45235,
          catKeysDir: testLegacyCahkeysDir
        })).resolves.toBe(200)
      }
    )
  }
)
