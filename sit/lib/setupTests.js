const { promisify } = require('util')
const childProcess = require('child_process')
const fse = require('fs-extra')
const startCatHttpsServer = require('./https/testCatHttpsServer')
const startCatTlsServer = require('./tls/testCatTlsServer')
const startHttpServer = require('./https/testHttpsServer')
const startTlsServer = require('./tls/testTlsServer')
const path = require('path')
const fs = require('fs')
const createHttpsCert = require('../../lib/createKey/createHttpsCert')

const execFile = promisify(childProcess.execFile)
const readFile = promisify(fs.readFile)
const rename = promisify(fs.rename)

const {
  cliCmd,
  testDir,
  testCatkeysDir,
  testCatkeysDir2,
  testClientOnlyCatkeysDir,
  testLegacyCahkeysDir,
  testSSLKeysDir
} = require('../filepaths')

module.exports = async () => {
  await fse.emptyDir(testDir)
  await fse.mkdir(testClientOnlyCatkeysDir)

  await execFile(
    'node',
    [cliCmd, 'create-key', '--server', '--keydir', testCatkeysDir]
  )
  await execFile('node', [cliCmd, 'create-key', '--keydir', testCatkeysDir])
  await execFile(
    'node',
    [cliCmd, 'create-key', '--keydir', testCatkeysDir, '--name', 'clientonly']
  )
  await execFile(
    'node',
    [cliCmd, 'create-key', '--server', '--keydir', testCatkeysDir2]
  )
  await execFile('node', [cliCmd, 'create-key', '--keydir', testCatkeysDir2])
  await execFile(
    'node',
    [cliCmd, 'create-key', '--server', '--keydir', testLegacyCahkeysDir]
  )
  await execFile(
    'node',
    [cliCmd, 'create-key', '--keydir', testLegacyCahkeysDir]
  )

  await rename(
    path.resolve(testLegacyCahkeysDir, 'server.catkey'),
    path.resolve(testLegacyCahkeysDir, 'server.cahkey')
  )
  await rename(
    path.resolve(testLegacyCahkeysDir, 'client.catkey'),
    path.resolve(testLegacyCahkeysDir, 'client.cahkey')
  )
  await rename(
    path.resolve(testCatkeysDir, 'clientonly.catkey'),
    path.resolve(testClientOnlyCatkeysDir, 'clientonly.catkey')
  )

  const stopServers = []

  stopServers.push(await startCatHttpsServer({ catKeysDir: testCatkeysDir }))
  stopServers.push(await startCatTlsServer({ catKeysDir: testCatkeysDir }))
  stopServers.push(await startCatHttpsServer({
    catCheckKeyExists: true,
    catKeysDir: testCatkeysDir,
    port: 45230
  }))
  stopServers.push(await startCatHttpsServer({
    catKeysDir: testLegacyCahkeysDir,
    port: 45235
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
