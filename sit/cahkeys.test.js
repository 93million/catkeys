/* global describe expect test */

const path = require('path')
const loadKey = require('../lib/loadKey')
const { testCahkeysDir } = require('./filepaths')

describe(
  'Key generation',
  () => {
    test(
      'should create valid authentication keys',
      async () => {
        const cahkey = await loadKey(path.resolve(
          testCahkeysDir,
          'server.cahkey'
        ))

        expect(cahkey).toEqual({
          ca: expect.any(Buffer),
          cert: expect.any(Buffer),
          key: expect.any(Buffer)
        })
      }
    )
  }
)
