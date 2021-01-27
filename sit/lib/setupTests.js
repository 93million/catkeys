const { promisify } = require('util')
const childProcess = require('child_process')
const fse = require('fs-extra')
const startCahHttpsServer = require('./https/testCahHttpsServer')
const startCahTlsServer = require('./tls/testCahTlsServer')
const startHttpServer = require('./https/testHttpsServer')
const startTlsServer = require('./tls/testTlsServer')
const path = require('path')
const fs = require('fs')
const createHttpsCert = require('../../lib/createKey/createHttpsCert')

const execFile = promisify(childProcess.execFile)
const readFile = promisify(fs.readFile)

const {
  cliCmd,
  testDir,
  testCahkeysDir,
  testCahkeysDir2,
  testSSLKeysDir
} = require('../filepaths')

module.exports = async () => {
  await fse.emptyDir(testDir)
  await execFile(
    'node',
    [cliCmd, 'create-key', '--server', '--keydir', testCahkeysDir]
  )
  await execFile('node', [cliCmd, 'create-key', '--keydir', testCahkeysDir])
  await execFile(
    'node',
    [cliCmd, 'create-key', '--server', '--keydir', testCahkeysDir2]
  )
  await execFile('node', [cliCmd, 'create-key', '--keydir', testCahkeysDir2])
  const stopServers = []

  stopServers.push(await startCahHttpsServer({ cahKeysDir: testCahkeysDir }))
  stopServers.push(await startCahTlsServer({ cahKeysDir: testCahkeysDir }))
  stopServers.push(await startCahHttpsServer({
    cahCheckKeyExists: true,
    cahKeysDir: testCahkeysDir,
    port: 45230
  }))
  await createHttpsCert({ keydir: testSSLKeysDir, commonName: 'localhost' })
  const selfSignedTlsCertOptions = {
    ca: await readFile(path.resolve(testSSLKeysDir, 'ca-crt.pem')),
    cert: await readFile(path.resolve(testSSLKeysDir, 'crt.pem')),
    key: await readFile(path.resolve(testSSLKeysDir, 'key.pem'))
  }

  stopServers.push(startHttpServer(selfSignedTlsCertOptions))
  stopServers.push(startTlsServer(selfSignedTlsCertOptions))

  return {
    cleanup: async () => {
      await fse.emptyDir(testDir)
      stopServers.forEach((stop) => stop())
    }
  }
}
