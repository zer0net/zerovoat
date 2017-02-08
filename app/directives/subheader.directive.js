app.directive('subheader', [
  function() {

    // subheader controller
    var controller = function($scope,$element) {
      // init subheader
      $scope.initSubHeader = function(layout){
        $scope.layout = layout;
      };
    };

    var template =  '<section class="subheader">'+
                      '<section class="container">' +
                        '<h1 ng-if="layout.subheader_title_text"><a ng-href="/{{page.site_info.address}}/index.html?channel_id={{layout.channel_id}}" ng-bind="layout.subheader_title_text"></a></h1>' +
                      '</section>' +
                    '</section>';

    return {
      restrict: 'AE',
      controller: controller,
      template:template
    }

  }
]);            