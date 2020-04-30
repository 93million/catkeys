const path = require('path')
const { promisify } = require('util')
const childProcess = require('child_process')
const fse = require('fs-extra')

const execFile = promisify(childProcess.execFile)

const {
  cliCmd,
  exampleDir,
  testDir,
  testCahkeysDir
} = require('../filepaths')

module.exports = async () => {
  await fse.emptyDir(testDir)
  await execFile(cliCmd, ['create-key', '--server', '--keydir', testCahkeysDir])
  await execFile(cliCmd, ['create-key', '--keydir', testCahkeysDir])
  await execFile('npm', ['install'], { cwd: exampleDir, env: process.env })

  const serveProcess = childProcess.execFile(
    'node',
    [path.resolve(exampleDir, 'serve.js')],
    { env: { ...process.env, CAH_KEYS_DIR: testCahkeysDir } }
  )

  return {
    cleanup: async () => {
      await fse.emptyDir(testDir)
      serveProcess.kill()
    }
  }
}
