const path = require('path')

const sitDir = path.resolve(__dirname)
const cliCmd = path.resolve(sitDir, '..', 'cli.js')
const binDir = path.resolve(sitDir, 'bin')
const testDir = path.resolve(sitDir, 'test')
const testCahkeysDir = path.resolve(testDir, 'cahkeys')
const testCahkeysDir2 = path.resolve(testDir, 'cahkeys2')
const testSSLKeysDir = path.resolve(testDir, 'ssl')

module.exports = {
  binDir,
  cliCmd,
  testDir,
  testCahkeysDir,
  testCahkeysDir2,
  testSSLKeysDir
}
