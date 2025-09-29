const path = require('path')
const childProcess = require('child_process')
const fs = require('fs')
const { promisify } = require('util')

const execFile = promisify(childProcess.execFile)
const unlink = promisify(fs.unlink)
const varDir = path.resolve(__dirname, '..', '..', 'var')
const extensionsCnfPath = path.resolve(varDir, 'cnf', 'cert-extensions.cnf')

module.exports = async (commonName, keydir, server) => {
  const subjectLocation = 'C=GB/ST=Tyne and Wear/L=Newcastle upon Tyne'
  const subjectOrg = 'O=catkeys/OU=catkeys'

  await execFile(
    'openssl',
    [
      'req',
      '-new',
      '-subj',
      `/${subjectLocation}/${subjectOrg}/CN=${commonName}`,
      '-key',
      path.resolve(keydir, 'key.pem'),
      '-out',
      path.resolve(keydir, 'csr.pem')
    ]
  )

  await execFile(
    'openssl',
    [
      'x509',
      '-req',
      '-days',
      '9999',
      '-in',
      path.resolve(keydir, 'csr.pem'),
      '-CA',
      path.resolve(keydir, 'ca-crt.pem'),
      '-CAkey',
      path.resolve(keydir, 'ca-key.pem'),
      '-CAcreateserial',
      '-CAserial',
      path.resolve(keydir, '.srl'),
      '-extfile',
      extensionsCnfPath,
      '-extensions',
      server === true ? 'server' : 'client',
      '-out',
      path.resolve(keydir, 'crt.pem')
    ]
  )

  await unlink(path.resolve(keydir, 'csr.pem'))
}
