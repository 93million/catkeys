const serverDefaultCommonName = '__catkeys_server__'
const serverValidCommonNames = [serverDefaultCommonName, 'localhost']

module.exports = {
  client: {
    defaultCommonName: 'client',
    invalidCommonNames: serverValidCommonNames
  },
  server: {
    defaultCommonName: serverDefaultCommonName,
    validCommonNames: serverValidCommonNames
  }
}
