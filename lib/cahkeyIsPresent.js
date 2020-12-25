const loadAllKeys = require('./loadAllKeys')
const locateKeysDir = require('./locateKeysDir')
const loadCert = require('./loadCert')

module.exports = async (
  { modulus: requestCertModulus },
  { cahKeysDir } = {}
) => {
  const keyDir = cahKeysDir || process.env.CAH_KEYS_DIR || await locateKeysDir()
  const keys = (await loadAllKeys(keyDir)).map(({ cert }) => loadCert(cert))

  return (
    keys.find(({ modulus }) => (modulus === requestCertModulus)) !== undefined
  )
}
