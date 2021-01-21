const setupTests = require('./lib/setupTests')

module.exports = async () => {
  global.setup = await setupTests()
}
