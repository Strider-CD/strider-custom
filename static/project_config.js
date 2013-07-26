function CustomCtrl() {
}

$(function(){
  var repo = $("html").data().controllerParams.repo_url; // EWW!

  $.getJSON("/custom/script", {url: repo}, function(res){
    $.each(['prepare', 'test', 'deploy', 'cleanup'], function(){
      var phase = this + ''
      $("#" + phase).val(res.results[phase] || '');
    })

      })


  $("#savecodebtn").click(function(){
    var out = {}

    $.each(['prepare', 'test', 'deploy', 'cleanup'], function(){
      var phase = this + ''
      , code = $("#" + phase).val();
      out[phase] = code;
    })

      $.post('/custom/script', {url:repo, scripts:out}, function(res){
        if(res.errors) throw res.errors;
        $('#savecodebtn').tooltip('show');
        setTimeout(function () {
          $('#savecodebtn').tooltip('hide');
        }, 500);
      })

  }).tooltip({trigger:'manual'}) 
})

