const fs = require('fs')
const fileExists = require('../fileExists')
const { promisify } = require('util')
const createTLSCa = require('./createTLSCa')
const createTLSKey = require('./createTLSKey')
const createTLSCert = require('./createTLSCert')

const mkdir = promisify(fs.mkdir)

module.exports = async ({ keydir, commonName }) => {
  if (await fileExists(keydir) === false) {
    await mkdir(keydir)
  }

  await createTLSCa(keydir)
  await createTLSKey(keydir)
  await createTLSCert(commonName, keydir)
}
