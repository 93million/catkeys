const path = require('path')
const childProcess = require('child_process')
const { promisify } = require('util')

const execFile = promisify(childProcess.execFile)

module.exports = async (keydir) => {
  await execFile(
    'openssl',
    ['genrsa', '-out', path.resolve(keydir, 'key.pem'), '4096']
  )
}
