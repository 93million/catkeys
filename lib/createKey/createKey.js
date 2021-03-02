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
const mkdir = promisify(fs.mkdir)

const clientKeyFilenames = ['ca-crt.pem', 'crt.pem', 'key.pem']
const serverKeyFilenames = [...clientKeyFilenames, 'ca-key.pem', '.srl']

const cleanup = async ({ keydir }) => {
  await Promise.all(
    serverKeyFilenames.map(async (filename) => {
      if (await fileExists(path.resolve(keydir, filename))) {
        await unlink(path.resolve(keydir, filename))
      }
    })
  )
}

module.exports = async ({
  commonName,
  force,
  keydir,
  server,
  updateServer
}) => {
  if (
    server !== true &&
    config.client.invalidCommonNames.includes(commonName)
  ) {
    throw new Error(`Client keys cannot be named ${commonName}`)
  }

  try {
    const serverKeyPath = path.resolve(keydir, 'server.catkey')

    if (await fileExists(keydir) === false) {
      await mkdir(keydir)
    }

    if (server === true && updateServer !== true) {
      if (force !== true && await fileExists(serverKeyPath)) {
        throw new Error(
          `Key ${serverKeyPath} exists. Use --force to overwrite.`
        )
      }

      await createTLSCa(keydir)
    } else {
      await extractFilesFromKey(
        serverKeyPath,
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
        fs.createReadStream(serverKeyPath),
        { '.srl': await readFile(path.resolve(keydir, '.srl')) }
      ),
      serverKeyPath
    )
  } finally {
    await cleanup({ keydir })
  }
}
