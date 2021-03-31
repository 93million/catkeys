const revokeKey = require('../../lib/createKey/revokeKey')
const locateKeysDir = require('../../lib/locateKeysDir')

module.exports = async () => ({
  cmd: 'revoke-key',
  desc: 'revoke a client key',
  builder: {
    name: {
      alias: 'n',
      description: 'common name of client/server key',
      required: true
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
      await revokeKey({
        keydir: argv.keydir,
        name: argv.name
      })
    } catch (e) {
      console.error('Failed to create key:', e.message)
    }
  }
})
