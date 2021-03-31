const extractFilesFromKey = require('../../lib/createKey/extractFilesFromKey')
const path = require('path')
const fileExists = require('../../lib/fileExists')
const fs = require('fs')
const { promisify } = require('util')

const mkdir = promisify(fs.mkdir)
const rmdir = promisify(fs.rmdir)

module.exports = {
  cmd: 'extract-key [path]',
  desc: 'extract PEM certs and keys from a .catkey file',
  builder: (yargs) => {
    yargs
      .positional(
        'path',
        {
          description: 'path to key file',
          type: 'string'
        }
      )
      .option({
        'output-dir': {
          alias: 'o',
          description: 'path to the directory to output the key files'
        }
      })
      .demandOption('path')
  },
  handler: async (argv) => {
    const pathParsed = path.parse(path.resolve(argv.path))
    const keyPath = path.resolve(argv.path)
    const outputDir = path.resolve(
      argv['output-dir'] || process.cwd(),
      pathParsed.name
    )
    const outputDirExists = await fileExists(outputDir)

    if (!await fileExists(keyPath)) {
      console.error(`${keyPath} does not exist`)

      return
    }

    try {
      if (!outputDirExists) {
        await mkdir(outputDir)
      }

      await extractFilesFromKey(keyPath, outputDir, { exclude: ['.srl'] })
    } catch (e) {
      console.error('Failed to extract key:', e.message)

      if (!outputDirExists) {
        await rmdir(outputDir)
      }
    }
  }
}
