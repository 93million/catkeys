/* global describe expect test */

const path = require('path')
const loadKey = require('../lib/loadKey')
const {
  cliCmd,
  testCatkeysDir,
  testCatkeysExtractionDir
} = require('./filepaths')
const childProcess = require('child_process')
const { promisify } = require('util')
const fileExists = require('../lib/fileExists')
const fs = require('fs')

const execFile = promisify(childProcess.execFile)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

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

    test(
      'should extract key into components',
      async () => {
        if (!await fileExists(testCatkeysExtractionDir)) {
          await mkdir(testCatkeysExtractionDir)
        }

        await execFile(
          'node',
          [
            cliCmd,
            'extract-key',
            '-o',
            testCatkeysExtractionDir,
            path.resolve(testCatkeysDir, 'server.catkey')
          ]
        )
        const stats = await Promise.all(
          ['ca-crt.pem', 'ca-key.pem', 'crt.pem', 'key.pem']
            .map((file) => stat(
              path.resolve(testCatkeysExtractionDir, 'server', file)
            ))
        )

        expect(stats.every(({ size }) => (size > 0))).toBe(true)
      }
    )
  }
)
