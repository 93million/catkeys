#! /usr/bin/env node

const childProcess = require('child_process')
const path = require('path')
const locateKeysDir = require('./lib/locateKeysDir')
const yargs = require('yargs')

const main = async () => {
  // eslint-disable-next-line
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
        keydir: {
          alias: 'k',
          default: await locateKeysDir(),
          description:
            'path to cahkeys directory (will locate closest if none provided)',
          required: true
        }
      },
      (argv) => {
        const name = argv.name || (argv.server ? 'localhost' : 'client')
        const scriptPath = path.resolve(
          __dirname,
          'create-keys',
          (argv.server === true)
            ? 'create-server-key.sh'
            : 'create-client-key.sh'
        )
        const scriptArgs = ['-n', name, '-k', argv.keydir]

        childProcess.execFile(scriptPath, scriptArgs, (err, stdout, stderr) => {
          if (err) {
            console.error(err)
          }

          if (stderr) {
            console.error(stderr)
          }
        })
      }
    )
    .argv
}

main()
