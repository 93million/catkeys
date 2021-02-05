/* global jest test expect */

const locateKeysDir = require('./locateKeysDir')
const path = require('path')
const fileExists = require('./fileExists')
const realPath = jest.requireActual('path')

const catKeysPath = realPath.resolve('/test/dir/dir1/catkeys')
const scriptPath = realPath.resolve('/test/dir/dir1/dir2/script')
const filePaths = [
  '/',
  '/test',
  '/test/dir',
  '/test/dir/file1',
  '/test/dir/dir1',
  catKeysPath,
  '/test/dir/dir1/file1',
  '/test/dir/dir1/dir2',
  scriptPath
].map((path) => realPath.resolve(path))

jest.mock('path')
jest.mock('./fileExists')

path.dirname.mockReturnValue(scriptPath)

fileExists.mockImplementation((path) => {
  return filePaths.includes(path)
})

test(
  'should locate directory containing catkeys',
  async () => {
    await expect(locateKeysDir()).resolves.toBe(catKeysPath)
  }
)

test(
  'should search for \'cahkeys\' directory',
  async () => {
    const cahkeysDirRegex = new RegExp(`\\${path.sep}cahkeys\\${path.sep}?$`)

    await locateKeysDir()

    expect(fileExists).toBeCalledWith(expect.stringMatching(cahkeysDirRegex))
  }
)
