const https = require('https')
const cahkeyIsPresent = require('../cahkeyIsPresent')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs')
const createServerOptions = require('../createServerOptions')

module.exports = async (...args) => {
  let [options] = getOptionsArgFromArgs(args)
  const { cahKeysDir, cahCheckKeyExists, ...receivedOptions } = options
  const requestHandler = args.find((arg) => (typeof arg === 'function'))

  options = { ...receivedOptions, ...await createServerOptions(options) }

  return https.createServer(
    options,
    async (req, res) => {
      if (
        cahCheckKeyExists === true &&
        await cahkeyIsPresent(
          req.connection.getPeerCertificate(),
          { cahKeysDir }
        ) === false
      ) {
        res.writeHead(403, 'Forbidden')
        res.write('cahkey not present on disk')
        res.end()
      } else {
        if (requestHandler !== undefined) {
          requestHandler(req, res)
        }
      }
    }
  )
}
