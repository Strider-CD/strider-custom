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
      // Run command
      var sh = ctx.shellWrap(json[cmd])
      ctx.forkProc(ctx.workingDir, sh.cmd, sh.args, function(exitCode) {
        if (exitCode !== 0) {
          ctx.striderMessage("Custom " + cmd + " command `"
            + json[cmd] + "` failed with exit code " + exitCode)
          return cb(exitCode)
        }
        ctx.striderMessage("Custom " + cmd + " command `"
            + json[cmd] + "` completed successfully")
        return cb(0)
      })
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
    getJson(
      path.join(ctx.workingDir, STRIDER_CUSTOM_JSON),
      function(err, json) {
        // No command found - continue
        if (!json.deploy) {
          return cb(0)
        }
        var cmd = 'git remote add heroku git@heroku.com:' + app + '.git'
        gitane.run(cwd, key, cmd, function(err, stdout, stderr) {
          if (err) return cb(1, null)
          ctx.updateStatus("queue.job_update", {stdout:stdout, stderr:stderr, stdmerged:stdout+stderr})
          gitane.run(cwd, key, json.deploy, function(err, stdout, stderr) {
            if (err) return cb(1, null)
            ctx.updateStatus("queue.job_update", {stdout:stdout, stderr:stderr, stdmerged:stdout+stderr})
            striderMessage("Deployment to Heroku successful.")
            cb(0)
          })
        })
    })
    return
  }  
  // Otherwise, just run it
  customCmd("deploy", ctx, cb)
}


module.exports = function(ctx, cb) {

  ctx.addDetectionRule({
    filename:STRIDER_CUSTOM_JSON,
    language:"custom",
    framework:null,
    exists:true,
    prepare:prepare,
    test:test,
    deploy:deploy,
  })


  console.log("strider-custom worker extension loaded")

  cb(null, null)
}
