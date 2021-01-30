const path = require('path')

const sitDir = path.resolve(__dirname)
const cliCmd = path.resolve(sitDir, '..', 'cli.js')
const binDir = path.resolve(sitDir, 'bin')
const testDir = path.resolve(sitDir, 'test')
const testLegacyCahkeysDir = path.resolve(testDir, 'cahkeys')
const testCatkeysDir = path.resolve(testDir, 'catkeys')
const testCatkeysDir2 = path.resolve(testDir, 'catkeys2')
const testSSLKeysDir = path.resolve(testDir, 'ssl')

module.exports = {
  binDir,
  cliCmd,
  testDir,
  testLegacyCahkeysDir,
  testCatkeysDir,
  testCatkeysDir2,
  testSSLKeysDir
}
