/* global afterAll beforeAll describe expect test */

const https = require('https')
const childProcess = require('child_process')
const path = require('path')
const loadKey = require('../lib/loadKey')
const setupTests = require('./lib/setupTests')
const {
  exampleDir,
  testCahkeysDir
} = require('./filepaths')

let setup

beforeAll(async () => {
  setup = await setupTests()
})

afterAll(async () => setup.cleanup())

describe(
  'Key generation',
  () => {
    test(
      'Should have created valid authentication keys',
      async () => {
        const cahkey = await loadKey(path.resolve(
          testCahkeysDir,
          'server.cahkey'
        ))

        expect(cahkey).toEqual({
          ca: expect.any(Buffer),
          cert: expect.any(Buffer),
          key: expect.any(Buffer)
        })
      }
    )
  }
)

describe(
  'Client',
  () => {
    test(
      'Should be able to connect to server using example script',
      () => {
        return new Promise((resolve, reject) => {
          childProcess.execFile(
            'node',
            [path.resolve(exampleDir, 'request.js')],
            { env: { ...process.env, CAH_KEYS_DIR: testCahkeysDir } },
            (err, stdout, stderr) => {
              if (err !== null) {
                throw new Error(err)
              }

              expect(stdout)
                .toBe('Data received: Dibber Dobber!!! Bimble Bomble!!!\n')
              expect(stderr).toBe('')
              resolve()
            }
          )
        })
      }
    )
    test(
      'normal httpd clients not be able to connect to server',
      async () => {
        const request = () => new Promise((resolve, reject) => {
          const req = https.request(
            {
              hostname: 'localhost',
              method: 'POST',
              port: 1443,
              rejectUnauthorized: false
            },
            (res) => {
              resolve('connection established')
            }
          )

          req.on('error', reject)
          req.write('')
          req.end()
        })

        await expect(request()).rejects.toThrow('socket hang up')
      }
    )
  }
)
