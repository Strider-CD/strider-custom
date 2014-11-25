'use strict';

module.exports = {
  init: function (config, context, done) {
    var config = config || {};
    
    done(null, {
      environment: shellCommand(config.environment, config.shell),
      prepare: shellCommand(config.prepare, config.shell),
      test: shellCommand(config.test, config.shell),
      deploy: shellCommand(config.deploy, config.shell),
      cleanup: shellCommand(config.cleanup, config.shell)
    });
  }
};

function shellCommand(command, shell) {
  if (!command) {
    return;
  }
  
  var normalizedCommand = command.replace(/#[^\n]*/g, '').trim();
  
  if (!normalizedCommand.length) {
    return;
  }
  
  if ((/bash/i).test(shell)) {  
    return {
      command: 'bash',
      args: ['-e', '-x', '-c', normalizedCommand]
    };
  }
  else if ((/powershell/i).test(shell)) {
    return {
      command: 'powershell',
      args: ['-NonInteractive', '-Command', normalizedCommand]
    }
  }
  else if (process.platform === 'win32') {
    return {
      command: 'cmd',
      args: ['/c', normalizedCommand]
    }
  }
  
  return {
    command: 'sh',
    args: ['-e', '-x', '-c', normalizedCommand]
  };
}
