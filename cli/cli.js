#! /usr/bin/env node

const yargs = require('yargs')
const commands = require('./commands')

const handleExec = async () => {
  // eslint-disable-next-line no-unused-expressions
  (await Object
    .keys(commands)
    .reduce(
      async (acc, key) => {
        const yargs = await acc
        const command = (typeof commands[key] === 'function')
          ? await commands[key]()
          : commands[key]
        const { cmd, desc, handler } = command
        const args = [
          cmd,
          desc,
          ...[command.builder, handler].filter((arg) => (arg !== undefined))
        ]

        yargs.command(...args)

        return yargs
      },
      Promise.resolve(yargs)
    )
  )
    .demandCommand()
    .strict()
    .argv
}

handleExec()
