const https = require('https')
const catkeyIsPresent = require('../catkeyIsPresent')
const getOptionsArgFromArgs = require('../getOptionsArgFromArgs')
const createServerOptions = require('../createServerOptions')

module.exports = async (...args) => {
  let [options] = getOptionsArgFromArgs(args)
  const { catKeysDir, catCheckKeyExists, ...receivedOptions } = options
  const requestHandler = args.find((arg) => (typeof arg === 'function'))

  options = { ...receivedOptions, ...await createServerOptions(options) }

  return https.createServer(
    options,
    async (req, res) => {
      if (
        catCheckKeyExists === true &&
        await catkeyIsPresent(
          req.connection.getPeerCertificate(),
          { catKeysDir }
        ) === false
      ) {
        res.writeHead(403, 'Forbidden')
        res.write('catkey not present on disk')
        res.end()
      } else {
        if (requestHandler !== undefined) {
          requestHandler(req, res)
        }
      }
    }
  )
}
