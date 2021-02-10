const { https: catHttps } = require('..')
const Benchmark = require('benchmark')
const setupTests = require('../sit/lib/setupTests')
const https = require('https')
const { testCatkeysDir } = require('../sit/filepaths')

let setup

const main = async () => {
  setup = await setupTests()

  const suite = new Benchmark.Suite()

  suite
    .add('https#request', {
      defer: true,
      fn: (deferred) => {
        const req = https.request(
          { port: 45232, rejectUnauthorized: false },
          (res) => { deferred.resolve() }
        )

        req.on('error', (e) => { throw e })
        req.end()
      }
    })
    .add('cat#request', {
      defer: true,
      fn: async (deferred) => {
        const req = await catHttps.request(
          { catKeysDir: testCatkeysDir, port: 45231 },
          (res) => { deferred.resolve() }
        )

        req.on('error', (e) => { throw e })
        req.end()
      }
    })
    .add('cat#request-catCheckKeyExists', {
      defer: true,
      fn: async (deferred) => {
        const req = await catHttps.request(
          { catKeysDir: testCatkeysDir, port: 45230 },
          (res) => { deferred.resolve() }
        )

        req.on('error', (e) => { throw e })
        req.end()
      }
    })
    .add('cat#request-catRejectMismatchedHostname', {
      defer: true,
      fn: async (deferred) => {
        const req = await catHttps.request(
          {
            catRejectMismatchedHostname: false,
            catKeysDir: testCatkeysDir,
            hostname: '127.0.0.1',
            port: 45231
          },
          (res) => { deferred.resolve() }
        )

        req.on('error', (e) => { throw e })
        req.end()
      }
    })
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .on('complete', function () {
      setup.cleanup()
    })
    .run()
}

main()
