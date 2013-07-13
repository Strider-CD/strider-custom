var fs = require('fs')
var gitane = require('gitane')
var path = require('path')

require('js-yaml');
var STRIDER_CUSTOM_FILES = ['.strider.yml', '.strider.json', 'strider-custom.yml', 'strider-custom.json'];
var STRIDER_CUSTOM_GLOB = '{.strider,strider-custom}.{json,yml}';

// Read & parse a config file
function loadConfig(filename, cb) {
  try {
    cb(null, require(filename));
  } catch (e) {
    cb(e, null);
  }
}


var runCmd = function(ctx, phase, cmd, cb){
  var sh = ctx.shellWrap(cmd)
  ctx.striderMessage("$ " + cmd);
  ctx.forkProc(ctx.workingDir, sh.cmd, sh.args, function(exitCode) {
    if (exitCode !== 0) {
      ctx.striderMessage("Custom " + phase + " command `"
        + cmd + "` failed with exit code " + exitCode)
      return cb(exitCode)
    }
    return cb(0)
  })
}

function findConfig(workingDir, cb) {
  var parseError = true;
  next(0);
  function next(i) {
    if (i >= STRIDER_CUSTOM_FILES.length) {
      return cb(parseError);
    }
    var fpath = path.join(workingDir, STRIDER_CUSTOM_FILES[i]);
    fs.stat(fpath, function (err, res) {
      if (err) return next(i+1);
      loadConfig(fpath, function (err, config) {
        if (err) {
          parseError = fpath;
          return next(i+1);
        }
        return cb(null, config);
      });
    });
  }
}

function getCustom(attr, ctx, next) {
  if (ctx.customConfig === false) return next(true);
  if (!ctx.customConfig) {
    return findConfig(ctx.workingDir, function (err, config) {
      if (err) {
        ctx.customConfig = false;
        if (err !== true) {
          ctx.striderMessage("Failed to parse " + err);
        }
        return next(true);
      }
      ctx.customConfig = config;
      if (typeof(config[attr])==='undefined') return next(true);
      return next(null, config[attr]);
    });
  }
  if (typeof(ctx.customConfig[attr]) === 'undefined') return next(true);
  next(null, ctx.customConfig[attr]);
}

function customCmd(phase, ctx, cb) {
  getCustom(phase, ctx, function (err, cmd) {
    runCmd(ctx, phase, cmd, cb);
  });
}

function prepare(ctx, cb) {
  customCmd("prepare", ctx, cb)
}

function test(ctx, cb) {
  customCmd("test", ctx, cb)
}

function deploy(ctx, cb) {
  // If Heroku, run in Gitane context which sets up SSH keys
  if (ctx.jobData.deploy_config) {
    var app = ctx.jobData.deploy_config.app
    var key = ctx.jobData.deploy_config.privkey
    getCustom('deploy', ctx, function (err, script) {
      if (err) return cb(0);
      var cmd = 'git remote add heroku git@heroku.com:' + app + '.git'
      gitane.run(ctx.workingDir, key, cmd, function(err, stdout, stderr) {
        if (err) return cb(1, null)
        ctx.updateStatus("queue.job_update", {stdout:stdout, stderr:stderr, stdmerged:stdout+stderr})
        gitane.run(ctx.workingDir, key, script, function(err, stdout, stderr) {
          if (err) return cb(1, null)
          ctx.updateStatus("queue.job_update", {stdout:stdout, stderr:stderr, stdmerged:stdout+stderr})
          ctx.striderMessage("Deployment to Heroku successful.")
          cb(0)
        })
      })
    })
    return
  }  
  // Otherwise, just run it
  customCmd("deploy", ctx, cb)
}

var genCustomScript = function(phase){
  return function(ctx, cb){
    var rconf = ctx.jobData.repo_config
    if (rconf.custom && rconf.custom[phase]){
      runCmd(ctx, phase, rconf.custom[phase], cb)
    } else {
      cb(0);
    }
  }
}

module.exports = function(ctx, cb) {

  ctx.addDetectionRule({
    filename:STRIDER_CUSTOM_GLOB,
    language:"custom",
    framework:null,
    exists:true,
    prepare:prepare,
    test:test,
    deploy:deploy,
  })

  ctx.addBuildHook({
      prepare: genCustomScript('prepare')
    , test: genCustomScript('test')
    , deploy: genCustomScript('deploy')
    , cleanup: genCustomScript('cleanup')
  })

  console.log("strider-custom worker extension loaded")

  cb(null, null)
}
