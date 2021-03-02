#! /usr/bin/env node

const locateKeysDir = require('./lib/locateKeysDir')
const createKey = require('./lib/createKey')
const yargs = require('yargs')
const config = require('./config')
const extractFilesFromKey = require('./lib/createKey/extractFilesFromKey')
const path = require('path')
const fileExists = require('./lib/fileExists')
const fs = require('fs')
const { promisify } = require('util')

const mkdir = promisify(fs.mkdir)
const rmdir = promisify(fs.rmdir)

const main = async () => {
  // eslint-disable-next-line no-unused-expressions
  yargs
    .command(
      'create-key',
      'create a new key',
      {
        name: {
          alias: 'n',
          description: 'common name of client/server key'
        },
        server: {
          alias: 's',
          boolean: true,
          default: false,
          description: 'generate a server key'
        },
        force: {
          alias: 'f',
          boolean: true,
          default: false,
          description: 'force overwrite an exisiting server key'
        },
        update: {
          alias: 'u',
          boolean: true,
          default: false,
          description: 'update server key (client keys remain valid)'
        },
        keydir: {
          alias: 'k',
          default: await locateKeysDir(),
          description:
            'path to catkeys dir (will search project root by default)',
          required: true
        }
      },
      async (argv) => {
        try {
          await createKey({
            server: argv.server,
            updateServer: argv.update,
            force: argv.force,
            keydir: argv.keydir,
            commonName: (
              argv.name ||
              (
                argv.server
                  ? config.server.defaultCommonName
                  : config.client.defaultCommonName
              )
            )
          })
        } catch (e) {
          console.error('Failed to create key:', e.message)
        }
      }
    )
    .command(
      'extract-key [path]',
      'extract PEM certs and keys from a .catkey file',
      (yargs) => {
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
      async (argv) => {
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
    )
    .demandCommand()
    .strict()
    .help()
    .argv
}

main()
