function shellCommand(command) {
  if (!command || !command.replace(/#[^\n]*/g, '').trim().length) return
  return {
    command: 'sh',
    args: ['-x', '-c', command]
  }
}
module.exports = {
  init: function (config, context, done) {
    var config = config || {}
    done(null, {
      environment: shellCommand(config.environment),
      prepare: shellCommand(config.prepare),
      test: shellCommand(config.test),
      deploy: shellCommand(config.deploy),
      cleanup: shellCommand(config.cleanup)
    })
  }
}
