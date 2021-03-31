const createKey = require('../../lib/createKey')
const locateKeysDir = require('../../lib/locateKeysDir')
const config = require('../../config')

module.exports = async () => ({
  cmd: 'create-key',
  desc: 'create a new key',
  builder: {
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
  handler: async (argv) => {
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
})
