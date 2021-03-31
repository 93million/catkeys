/* global jest test expect */

const fileExists = require('./fileExists')
const path = require('path')
const getCatKeyFilename = require('./getCatKeyFilename')

jest.mock('./fileExists')
jest.mock('./fileExists')

fileExists.mockReturnValue(Promise.resolve(false))

const catKey = 'testkey'
const catKeyDir = '/test/catkeys/dir'

test(
  'should locate files with `.cahkeys` ext when it exists',
  async () => {
    fileExists.mockReturnValueOnce(true)

    await expect(getCatKeyFilename(catKeyDir, catKey))
      .resolves.toBe(path.resolve(catKeyDir, `${catKey}.cahkey`))
  }
)

test(
  'should locate files with `.catkeys` ext when not .cahkeys file exists',
  async () => {
    fileExists.mockReturnValueOnce(false)

    await expect(getCatKeyFilename(catKeyDir, catKey))
      .resolves.toBe(path.resolve(catKeyDir, `${catKey}.catkey`))
  }
)
