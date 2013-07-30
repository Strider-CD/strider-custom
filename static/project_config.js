
app.controller('CustomCtrl', ['$scope', function ($scope) {

  function save(url, scripts, done) {
    $.ajax({
      url: '/custom/script',
      type: 'POST',
      data: {url: url, scripts: scripts},
      dataType: 'json',
      success: function (data, ts, xhr) {
        done(null);
      },
      error: function (xhr, ts, e) {
        if (xhr && xhr.responseText) {
          var data = $.parseJSON(xhr.responseText);
          e = data.errors[0];
        }
        done(e);
      }
    });
  }

  $scope.scripts = $scope.panelData.custom;
  $scope.save = function () {
    $scope.saving = true;
    save($scope.repo.url, $scope.scripts, function (err) {
      $scope.saving = false;
      if (err) {
        $scope.error(err);
      } else {
        $scope.success('Saved custom scripts');
      }
      $scope.$root.$digest();
    });
  };

}]);
