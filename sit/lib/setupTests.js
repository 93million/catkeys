const { promisify } = require('util')
const childProcess = require('child_process')
const fse = require('fs-extra')
const startCahServer = require('./testCahServer')
const startHttpServer = require('./testHttpsServer')
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
  const stopServers = []
  stopServers.push(await startCahServer({ cahKeysDir: testCahkeysDir }))
  stopServers.push(await startCahServer({
    cahCheckKeyExists: true,
    cahKeysDir: testCahkeysDir,
    port: 45230
  }))
  await execFile(
    path.resolve(binDir, 'create-https-cert.sh'),
    ['-k', testSSLKeysDir, '-n', 'localhost']
  )
  stopServers.push(startHttpServer({
    ca: await readFile(path.resolve(testSSLKeysDir, 'ca-crt.pem')),
    cert: await readFile(path.resolve(testSSLKeysDir, 'crt.pem')),
    key: await readFile(path.resolve(testSSLKeysDir, 'key.pem'))
  }))

  return {
    cleanup: async () => {
      await fse.emptyDir(testDir)
      stopServers.forEach((stop) => stop())
    }
  }
}
