const { promisify } = require('util')
const childProcess = require('child_process')
const fse = require('fs-extra')
const {
  start: startCahServer,
  stop: stopCahServer
} = require('./testCahServer')
const {
  start: startHttpServer,
  stop: stopHttpsServer
} = require('./testHttpsServer')
const path = require('path')
const fs = require('fs')

const execFile = promisify(childProcess.execFile)
const readFile = promisify(fs.readFile)

const {
  binDir,
  cliCmd,
  testDir,
  testCahkeysDir,
  testCahkeysDir2,
  testSSLKeysDir
} = require('../filepaths')

module.exports = async () => {
  await fse.emptyDir(testDir)
  await execFile(cliCmd, ['create-key', '--server', '--keydir', testCahkeysDir])
  await execFile(cliCmd, ['create-key', '--keydir', testCahkeysDir])
  await execFile(
    cliCmd,
    ['create-key', '--server', '--keydir', testCahkeysDir2]
  )
  await execFile(cliCmd, ['create-key', '--keydir', testCahkeysDir2])
  await startCahServer({ cahKeysDir: testCahkeysDir })
  await execFile(
    path.resolve(binDir, 'create-https-cert.sh'),
    ['-k', testSSLKeysDir, '-n', 'localhost']
  )
  startHttpServer({
    ca: await readFile(path.resolve(testSSLKeysDir, 'ca-crt.pem')),
    cert: await readFile(path.resolve(testSSLKeysDir, 'crt.pem')),
    key: await readFile(path.resolve(testSSLKeysDir, 'key.pem'))
  })

  return {
    cleanup: async () => {
      await fse.emptyDir(testDir)
      stopCahServer()
      stopHttpsServer()
    }
  }
}
