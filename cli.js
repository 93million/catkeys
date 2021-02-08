#! /usr/bin/env node

const locateKeysDir = require('./lib/locateKeysDir')
const createKey = require('./lib/createKey')
const yargs = require('yargs')

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
            keydir: argv.keydir,
            commonName: argv.name || (argv.server ? 'localhost' : 'client')
          })
        } catch (e) {
          console.error('Failed to create key', e)
        }
      }
    )
    .demandCommand()
    .argv
}

main()
