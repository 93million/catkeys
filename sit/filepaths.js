const path = require('path')

const cliCmd = path.resolve(__dirname, '..', 'cli.js')
const exampleDir = path.resolve(__dirname, '..', 'example')
const testDir = path.resolve(__dirname, 'test')
const testCahkeysDir = path.resolve(testDir, 'cahkeys')

module.exports = {
  cliCmd,
  exampleDir,
  testDir,
  testCahkeysDir
}
