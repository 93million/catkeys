const extractFilesFromKey = require('./extractFilesFromKey')
const getCatKeyFilename = require('../getCatKeyFilename')
const fileExists = require('../fileExists')
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const { promisify } = require('util')
const updateKeyArchiveStream = require('./updateKeyArchiveStream')
const writeStream = require('../writeStream')

const execFile = promisify(childProcess.execFile)
const unlink = promisify(fs.unlink)
const readFile = promisify(fs.readFile)
const close = promisify(fs.close)
const open = promisify(fs.open)

const varDir = path.resolve(__dirname, '..', '..', 'var')
const extractFiles = [
  'ca-crt.pem',
  'ca-key.pem',
  'ca-crl.pem',
  'ca-database.txt'
]

const cleanup = async (keydir) => {
  const cleanupFiles = [
    ...extractFiles,
    'ca-database.txt.attr',
    'ca-database.txt.attr.old',
    'ca-database.txt.old',
    'crt.pem'
  ]

  await Promise.all(cleanupFiles.map(async (filename) => {
    const filePath = path.resolve(keydir, filename)

    if (await fileExists(filePath)) {
      await unlink(filePath)
    }
  }))
}

module.exports = async ({ keydir, name }) => {
  const caCnfPath = path.resolve(varDir, 'cnf', 'ca.cnf')
  const serverKeyPath = await getCatKeyFilename(keydir, 'server')
  const clientKeyPath = await getCatKeyFilename(keydir, name)

  try {
    await extractFilesFromKey(serverKeyPath, keydir, { include: extractFiles })
    await extractFilesFromKey(clientKeyPath, keydir, { include: ['crt.pem'] })

    const caDatabasePath = path.resolve(keydir, 'ca-database.txt')

    if (!await fileExists(caDatabasePath)) {
      await close(await open(caDatabasePath, 'w'))
    }

    await execFile(
      'openssl',
      [
        'ca',
        '-revoke',
        path.resolve(keydir, 'crt.pem'),
        '-keyfile',
        path.resolve(keydir, 'ca-key.pem'),
        '-config',
        caCnfPath,
        '-cert',
        path.resolve(keydir, 'ca-crt.pem')
      ],
      { cwd: keydir }
    )

    await execFile(
      'openssl',
      [
        'ca',
        '-keyfile',
        path.resolve(keydir, 'ca-key.pem'),
        '-cert',
        path.resolve(keydir, 'ca-crt.pem'),
        '-config',
        caCnfPath,
        '-gencrl',
        '-out',
        path.resolve(keydir, 'ca-crl.pem')
      ],
      { cwd: keydir }
    )

    await writeStream(
      await updateKeyArchiveStream(
        fs.createReadStream(serverKeyPath),
        {
          'ca-crl.pem': await readFile(path.resolve(keydir, 'ca-crl.pem')),
          'ca-database.txt': await readFile(
            path.resolve(keydir, 'ca-database.txt')
          )
        }
      ),
      serverKeyPath
    )
  } finally {
    await cleanup(keydir)
  }
}
