module.exports = {
  init: function (config, context, done) {
    var config = config || {}
    done(null, {
      environment: config.environment,
      prepare: config.prepare,
      test: config.test,
      deploy: config.deploy,
      cleanup: config.cleanup
    })
  }
}
