'use strict';

var debug = require('debug')('strider-custom:worker');
var ejs = require('ejs');

module.exports = {
  init: function (config, job, context, done) {
    try {
      config = config || {};
      var result = {
        environment: shellCommand(config.environment, config.shell, job),
        prepare: shellCommand(config.prepare, config.shell, job),
        test: shellCommand(config.test, config.shell, job),
        deploy: shellCommand(config.deploy, config.shell, job),
        cleanup: shellCommand(config.cleanup, config.shell, job)
      };

      done(null, result);
    } catch (e) {
      debug(e);
      done(e);
    }
  }
};

function shellCommand(command, shell, job) {
  if (!command) {
    return;
  }

  var commands;
  if (Array.isArray(command)) {
    // The plugin was passed an array of commands to run.
    commands = command;

  } else if (typeof command === 'string') {
    // The plugin was passed a string, to be treated as a single command.
    commands = command.split('\n');

  } else if (typeof command === 'object') {
    // The plugin was passed an object, which is expected to have a "command" member, containing the command as a string.
    // Additionally, the object might contain a "screen" member to control the output in the web UI.
    if (command.command) {
      commands = command.command.split('\n');
      commands.screen = command.screen;
    }
  }
  if (!commands) {
    debug('Invalid command passed.', command);
    return null;
  }

  // Generate individual command descriptions for each given command, if the input was an array.
  if (1 < commands.length && Array.isArray(command)) {
    return commands.map(function (commandLine) {
      return shellCommand(commandLine, shell, job);
    });
  }

  var normalizedCommand = commands.reduce(function (lines, line) {
    line = line.replace(/^\s*#.*$/, '').trim();
    if (line.length) lines.push(line);
    return lines;
  }, []).join('\n');

  if (!normalizedCommand.length) {
    return;
  }

  var commandToExecute = compileScript(job, normalizedCommand);
  debug('Compiled command', commandToExecute);

  if ((/bash/i).test(shell)) {
    return {
      command: 'bash',
      args: ['-e', '-x', '-c', commandToExecute],
      screen: commands.screen
    };

  } else if ((/powershell/i).test(shell)) {
    return {
      command: 'powershell',
      args: ['-NonInteractive', '-Command', commandToExecute],
      screen: commands.screen
    };

  } else if (process.platform === 'win32') {
    return {
      command: 'cmd',
      args: ['/c', commandToExecute],
      screen: commands.screen
    };
  }

  return {
    command: 'sh',
    args: ['-e', '-x', '-c', commandToExecute],
    screen: commands.screen
  };
}

function compileScript(job, shellScript) {
  var compiled = ejs.compile(shellScript, 'utf-8');
  var compiledScript = compiled(job);

  return compiledScript;
}
