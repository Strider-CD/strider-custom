var path = require('path')

function error(err_msg, res) {
  console.error("Strider-Custom:", err_msg)
  var r = {
    errors: [err_msg],
    status: "error"
  }
  res.statusCode = 400
  return res.end(JSON.stringify(r, null, '\t'))
}


module.exports = function(ctx, cb) {

  /*
   * GET /custom/script
   *
   * @param url Github html_url of the project.
   */
  ctx.route.get("/custom/script",
    ctx.middleware.require_auth,
    ctx.middleware.require_params(["url"]),
    function(req, res, next){
      var url = req.param("url")

      req.user.get_repo_config(url, function(err, repo, access_level, owner_user_obj) {
        if (err) {
          return error("GET /custom/script : Error fetching Repo Config for url " + url + ": " + err, res)
        }
        var results = repo.get('custom')
        if (!results) results = {}
        var r = {
          status: "ok",
          errors: [],
          results: results
        }
        return res.end(JSON.stringify(r, null, '\t'))
    })
  });

  /*
   * POST /custom/script
   *
   * Set the current Strider environment config for specified project.
   *
   * @param url Github html_url of the project.
   * @param scripts JSON Encoded {prepare, test, deploy, cleanup} Shell script
   *
   */
  ctx.route.post("/custom/script",
    ctx.middleware.require_auth,
    ctx.middleware.require_params(["scripts"]),
    function postEnv(req, res) {
      var url = req.param("url")
      var scripts = req.param("scripts")

      req.user.get_repo_config(url, function(err, repo, access_level, owner_user_obj) {
        if (err) {
          return error("POST /custom/script : Error fetching Repo Config for url " + url + ": " + err, res)
        }
        // must have access_level > 0 to be able to continue;
        if (access_level < 1) {
            return error(
              "You must have access level greater than 0 in order to be able to add custom scripts", res, 403)
        }
        var invalid = false

        if (typeof scripts == 'string'){
          try {
            scripts = JSON.parse(scripts)
            if (typeof(env) !== 'object') {
              invalid = true
            }
          } catch(e) {
            invalid = true
          }
          if (invalid) {
            return error("Error decoding `scripts` parameter - must be JSON-encoded object", res)
          }
        }
        repo.custom = scripts
        var r = {
          status: "ok",
          errors: [],
          results: {
            custom:scripts
          }
        }
        repo.set('custom', scripts)
        req.user.save(function(err) {
          if (err) {
            var errmsg = "Error saving custom scripts config " + req.user.email + ": " + err;
            return error(errmsg, res)
          }
          return res.end(JSON.stringify(r, null, '\t'))
        })
      })

    })

  ctx.models.RepoConfig.plugin(
    function(schema, opts) {
      schema.add({
        custom: {}
      })
  })


  console.log("strider-custom webapp extension loaded")
  cb(null, null)
}
