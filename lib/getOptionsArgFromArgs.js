module.exports = (args) => {
  const optionsArgIndex = args.findIndex((arg) => (typeof arg === 'object'))
  const options = (optionsArgIndex === -1) ? {} : args[optionsArgIndex]

  if (optionsArgIndex === -1) {
    if (args.length === 0) {
      args.push(options)
    } else {
      args.splice(args.length - 1, 0, options)
    }
  }

  return options
}
