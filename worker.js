'use strict';

var ejs = require('ejs');

module.exports = {
  init: function (config, job, context, done) {
    var config = config || {};
    
    done(null, {
      environment: shellCommand(config.environment, job),
      prepare: shellCommand(config.prepare, job),
      test: shellCommand(config.test, job),
      deploy: shellCommand(config.deploy, job),
      cleanup: shellCommand(config.cleanup, job)
    });
  }
};

function shellCommand(command, job) {
  if (!command) {
    return;
  }
  
  var normalizedCommand = command.replace(/#[^\n]*/g, '').trim();
  
  if (!normalizedCommand.length) {
    return;
  }

  var commandToExecute = compileScript(job, normalizedCommand);
  
  return {
    command: 'bash',
    args: ['-e', '-x', '-c', commandToExecute]
  };
}

var compileScript = function(job, shellScript) {
  var compiled = ejs.compile(shellScript,'utf-8');
  var compiledScript = compiled(job);

  return compiledScript;
};
