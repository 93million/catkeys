/* global jest test expect */

const locateKeysDir = require('./locateKeysDir')
const path = require('path')
const fileExists = require('./fileExists')
const appRootPath = require('app-root-path')

const mockRootPath = '/test/project'
const catKeysPath = `${mockRootPath}/catkeys`
const filePaths = [
  '/',
  '/test',
  mockRootPath,
  catKeysPath,
  `${mockRootPath}/dir1`,
  `${mockRootPath}/dir1/file1`,
  `${mockRootPath}/dir1/dir2`,
  `${mockRootPath}/file2`,
  '/test/project2'
].map((_path) => path.resolve(_path))

jest.mock('./fileExists')
jest.mock('app-root-path')

appRootPath.resolve.mockImplementation((_path) => {
  return path.resolve(mockRootPath, _path)
})

fileExists.mockImplementation((path) => filePaths.includes(path))

test(
  'should locate catkeys dir in project root directory',
  async () => {
    await expect(locateKeysDir()).resolves.toBe(path.resolve(catKeysPath))
  }
)

test(
  'should locate cahkeys when catkeys dir doesn\'t exist',
  async () => {
    const filePaths = [
      mockRootPath,
      `${mockRootPath}/cahkeys`
    ].map((_path) => path.resolve(_path))

    fileExists.mockImplementationOnce((path) => filePaths.includes(path))
    fileExists.mockImplementationOnce((path) => filePaths.includes(path))

    await expect(locateKeysDir())
      .resolves
      .toBe(path.resolve(mockRootPath, 'cahkeys'))
  }
)

test(
  'should resolve to undefined if catkeys dir doesn\'t exist',
  async () => {
    fileExists.mockReturnValueOnce(Promise.resolve(false))
    fileExists.mockReturnValueOnce(Promise.resolve(false))

    await expect(locateKeysDir()).resolves.toBeUndefined()
  }
)
