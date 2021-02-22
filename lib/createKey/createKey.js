const path = require('path')
const fs = require('fs')
const createTLSCa = require('./createTLSCa')
const createTLSKey = require('./createTLSKey')
const createTLSCert = require('./createTLSCert')
const createKeyArchiveStreamFromDir = require('./createKeyArchiveStreamFromDir')
const writeStream = require('../writeStream')
const extractFilesFromKey = require('./extractFilesFromKey')
const fileExists = require('../fileExists')
const { promisify } = require('util')
const updateKeyArchiveStream = require('./updateKeyArchiveStream')
const config = require('../../config')

const unlink = promisify(fs.unlink)
const readFile = promisify(fs.readFile)

const clientKeyFilenames = ['ca-crt.pem', 'crt.pem', 'key.pem']
const serverKeyFilenames = [...clientKeyFilenames, 'ca-key.pem', '.srl']

const cleanup = async ({ keydir }) => {
  await Promise.all(
    serverKeyFilenames.map((filename) => unlink(path.resolve(keydir, filename)))
  )
}

const mkdir = promisify(fs.mkdir)

module.exports = async ({ server, keydir, commonName }) => {
  if (
    server !== true &&
    config.client.invalidCommonNames.includes(commonName)
  ) {
    throw new Error(`Client keys cannot be named ${commonName}`)
  }

  try {
    if (await fileExists(keydir) === false) {
      await mkdir(keydir)
    }

    if (server === true) {
      await createTLSCa(keydir)
    } else {
      await extractFilesFromKey(
        path.resolve(keydir, 'server.catkey'),
        keydir,
        { include: ['ca-crt.pem', 'ca-key.pem', '.srl'] }
      )
    }

    await createTLSKey(keydir)
    await createTLSCert(commonName, keydir)

    const keyName = (server === true) ? 'server' : commonName

    await writeStream(
      await createKeyArchiveStreamFromDir(keydir, { server }),
      path.resolve(keydir, `${keyName}.catkey`)
    )

    await writeStream(
      await updateKeyArchiveStream(
        fs.createReadStream(path.resolve(keydir, 'server.catkey')),
        { '.srl': await readFile(path.resolve(keydir, '.srl')) }
      ),
      path.resolve(keydir, 'server.catkey')
    )
  } finally {
    await cleanup({ keydir })
  }
}
