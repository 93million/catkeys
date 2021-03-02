const path = require('path')

const sitDir = path.resolve(__dirname)
const cliCmd = path.resolve(sitDir, '..', 'cli.js')
const binDir = path.resolve(sitDir, 'bin')
const testDir = path.resolve(sitDir, 'test')
const testLegacyCahkeysDir = path.resolve(testDir, 'cahkeys')
const testCatkeysDir = path.resolve(testDir, 'catkeys')
const testCatkeysDir2 = path.resolve(testDir, 'catkeys2')
const testClientOnlyCatkeysDir = path.resolve(testDir, 'clientonlycatkeys')
const testUpdatedServerKeyCatkeysDir = path.resolve(
  testDir,
  'updatedservercatkeys'
)
const testCatkeysClientServerSwapDir = path.resolve(
  testDir,
  'clientserverswapcatkeys'
)
const testSSLKeysDir = path.resolve(testDir, 'ssl')
const testCatkeysExtractionDir = path.resolve(testDir, 'extract')

module.exports = {
  binDir,
  cliCmd,
  testDir,
  testCatkeysClientServerSwapDir,
  testCatkeysDir,
  testCatkeysDir2,
  testCatkeysExtractionDir,
  testClientOnlyCatkeysDir,
  testLegacyCahkeysDir,
  testSSLKeysDir,
  testUpdatedServerKeyCatkeysDir
}
