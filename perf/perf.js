const { https: cahHttps } = require('..')
const Benchmark = require('benchmark')
const setupTests = require('../sit/lib/setupTests')
const https = require('https')
const { testCahkeysDir } = require('../sit/filepaths')

let setup

const main = async () => {
  setup = await setupTests()

  const suite = new Benchmark.Suite()

  // return
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
    .add('cah#request', {
      defer: true,
      fn: async (deferred) => {
        const req = await cahHttps.request(
          { cahKeysDir: testCahkeysDir, port: 45231 },
          (res) => { deferred.resolve() }
        )
        req.on('error', (e) => { throw e })
        req.end()
      }
    })
    .add('cah#request-cahCheckKeyExists', {
      defer: true,
      fn: async (deferred) => {
        const req = await cahHttps.request(
          { cahKeysDir: testCahkeysDir, port: 45230 },
          (res) => { deferred.resolve() }
        )
        req.on('error', (e) => { throw e })
        req.end()
      }
    })
    .add('cah#request-cahIgnoreMismatchedHostName', {
      defer: true,
      fn: async (deferred) => {
        const req = await cahHttps.request(
          {
            cahIgnoreMismatchedHostName: true,
            cahKeysDir: testCahkeysDir,
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
      // console.log('Fastest is ' + this.filter('fastest').map('name'))
      setup.cleanup()
    })
    .run()
}

main()
