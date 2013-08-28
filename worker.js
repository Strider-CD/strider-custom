var fs = require('fs')
var gitane = require('gitane')
var path = require('path')

var STRIDER_CUSTOM_JSON = "strider-custom.json"

// Read & parse a JSON file
function getJson(filename, cb) {
  fs.readFile(filename, function(err, data) {
    if (err) return cb(err, null)
    try {
      var json = JSON.parse(data)
      cb(null, json)
    } catch(e) {
      cb(e, null)
    }
  })
}

var runCmd = function(ctx, phase, cmd, cb){
  var sh = ctx.shellWrap(cmd)
  ctx.forkProc(ctx.workingDir, sh.cmd, sh.args, function(exitCode) {
    if (exitCode) {
      ctx.striderMessage("Custom " + phase + " command `"
        + cmd + "` failed with exit code " + exitCode)
      return cb(exitCode)
    }

    return cb(0)
  })
}


function customCmd(cmd, ctx, cb) {
  getJson(
    path.join(ctx.workingDir, STRIDER_CUSTOM_JSON),
    function(err, json) {
      if (err) {
        ctx.striderMessage("Failed to parse " + STRIDER_CUSTOM_JSON)
        return cb(0)
      }
      // No command found - continue
      if (!json[cmd]) {
        return cb(0)
      }

      runCmd(ctx, cmd, json[cmd], cb);
  })
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
    getJson(
      path.join(ctx.workingDir, STRIDER_CUSTOM_JSON),
      function(err, json) {
        if (err) {
          ctx.striderMessage("Failed to parse " + STRIDER_CUSTOM_JSON)
          return cb(0)
        }
        // No command found - continue
        if (!json.deploy) {
          return cb(0)
        }
        var cmd = 'git remote add heroku git@heroku.com:' + app + '.git'
        gitane.run(ctx.workingDir, key, cmd, function(err, stdout, stderr) {
          if (err) return cb(1, null)
          ctx.updateStatus("queue.job_update", {stdout:stdout, stderr:stderr, stdmerged:stdout+stderr})
          gitane.run(ctx.workingDir, key, json.deploy, function(err, stdout, stderr) {
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
  ctx.addBuildHook({
      prepare: genCustomScript('prepare')
    , test: genCustomScript('test')
    , deploy: genCustomScript('deploy')
    , cleanup: genCustomScript('cleanup')
  })



  console.log("strider-custom worker extension loaded")

  cb(null, null)
}
