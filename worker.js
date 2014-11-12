'use strict';

module.exports = {
  init: function (config, context, done) {
    var config = config || {};
    
    done(null, {
      environment: shellCommand(config.environment),
      prepare: shellCommand(config.prepare),
      test: shellCommand(config.test),
      deploy: shellCommand(config.deploy),
      cleanup: shellCommand(config.cleanup)
    });
  }
};

function shellCommand(command) {
  if (!command) {
    return;
  }
  
  var normalizedCommand = command.replace(/#[^\n]*/g, '').trim();
  
  if (!normalizedCommand.length) {
    return;
  }
  
  return {
    command: 'bash',
    args: ['-e', '-x', '-c', normalizedCommand]
  };
}
