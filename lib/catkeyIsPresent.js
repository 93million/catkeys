const loadAllKeys = require('./loadAllKeys')
const locateKeysDir = require('./locateKeysDir')
const loadCert = require('./loadCert')

module.exports = async (
  { modulus: requestCertModulus },
  { catKeysDir } = {}
) => {
  const keyDir = catKeysDir || process.env.CAT_KEYS_DIR || await locateKeysDir()
  const keys = (await loadAllKeys(keyDir)).map(({ cert }) => loadCert(cert))

  return (
    keys.find(({ modulus }) => (modulus === requestCertModulus)) !== undefined
  )
}
