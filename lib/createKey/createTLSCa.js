const path = require('path')
const childProcess = require('child_process')
const { promisify } = require('util')

const execFile = promisify(childProcess.execFile)

const varDir = path.resolve(__dirname, '..', '..', 'var')

module.exports = async (keydir) => {
  const caCnfPath = path.resolve(varDir, 'cnf', 'ca.cnf')

  await execFile(
    'openssl',
    [
      'req',
      '-new',
      '-x509',
      '-days',
      '9999',
      '-config',
      caCnfPath,
      '-extensions',
      'v3_ca',
      '-keyout',
      path.resolve(keydir, 'ca-key.pem'),
      '-out',
      path.resolve(keydir, 'ca-crt.pem'),
      '-nodes'
    ]
  )
}
