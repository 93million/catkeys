/* global describe expect test */

const path = require('path')
const loadKey = require('../lib/loadKey')
const { testCatkeysDir } = require('./filepaths')

describe(
  'Key generation',
  () => {
    test(
      'should create valid authentication keys',
      async () => {
        const catkey = await loadKey(path.resolve(
          testCatkeysDir,
          'server.catkey'
        ))

        expect(catkey).toEqual({
          ca: expect.any(Buffer),
          cert: expect.any(Buffer),
          key: expect.any(Buffer)
        })
      }
    )
  }
)
