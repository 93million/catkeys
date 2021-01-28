/* global describe expect test */

const tls = require('tls')
const testConnect = require('./lib/tls/testConnect')
const { testCatkeysDir2 } = require('./filepaths')

describe(
  'CAT TLS Server',
  () => {
    test(
      'should reject connections from regular tls clients',
      async () => {
        const request = () => new Promise((resolve, reject) => {
          const socket = tls.connect(
            {
              host: 'localhost',
              port: 45233,
              rejectUnauthorized: false,
              servername: 'localhost'
            }
          )
          const chunks = []

          socket.setEncoding('utf8')
          socket.on('data', (chunk) => {
            chunks.push(chunk)
          })
          socket.on('secureConnect', () => {
            if (socket.authorized === true) {
              resolve('secure connection established')
            }
          })
          socket.on('error', reject)
          socket.write('')
          socket.end()
        })

        await expect(request())
          .rejects
          .toHaveProperty('code', 'ERR_SSL_TLSV13_ALERT_CERTIFICATE_REQUIRED')
      }
    )

    test(
      'should reject connections from clients with an invalid catkey',
      async () => {
        await expect(testConnect({
          catKeysDir: testCatkeysDir2,
          rejectUnauthorized: false
        }))
          .rejects
          .toBe('CERT_SIGNATURE_FAILURE')
      }
    )
  }
)

describe(
  'CAT TLS Client',
  () => {
    test(
      'should connect using a valid catkey',
      async () => {
        await expect(testConnect()).resolves.toBe('Hello from CAT')
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should connect using a valid catkey to an mismatched hostname using `catIgnoreMismatchedHostName: true`',
      async () => {
        await expect(testConnect({
          catIgnoreMismatchedHostName: true,
          host: '127.0.0.1'
        }))
          .resolves
          .toBe('Hello from CAT')
      }
    )

    test(
      // eslint-disable-next-line max-len
      'should refuse to connect to server when hostname doesn\'t match cert alt name',
      async () => {
        await expect(testConnect({ host: '127.0.0.1' }))
          .rejects
          .toHaveProperty('code', 'ERR_TLS_CERT_ALTNAME_INVALID')
      }
    )

    test(
      'should refuse to connect to servers with self signed certs',
      async () => {
        await expect(testConnect({
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
        await expect(testConnect({
          catIgnoreMismatchedHostName: true,
          host: 'google.com',
          port: 443,
          servername: 'google.com'
        }))
          .rejects
          .toHaveProperty('code', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY')
      }
    )
  }
)
