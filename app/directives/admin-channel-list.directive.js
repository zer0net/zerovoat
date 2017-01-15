app.directive('adminChannelList', [
  function() {

    // channel list controller
    var controller = function($scope,$element) {
      // get topic comments
      $scope.countChannelTopics = function(channel) {
        var query = ["SELECT count(*) FROM topic WHERE channel_id='"+channel.channel_id+"'"];
        Page.cmd("dbQuery", query, function(topicCount) {
          $scope.$apply(function(){
            channel.topics_total = topicCount[0]['count(*)'];
          });
        });       
      };

    };

    var template =  '<div class="admin-channel-list row">' +
                      '<div ng-repeat="channel in channels" class="channel-item" ng-init="countChannelTopics(channel)">' +
                          '<div class="channel-item-top col-xs-12">' +
                            '<h3><a href="/{{page.site_info.address}}/?channel_id={{channel.channel_id}}">{{channel.name}} <small class="channel-topic-count">[{{channel.topics_total}}]</small></a></h3>' +
                            '<div class="admin-options">' +
                              '<div ng-if="admin_section === \'my_channels\'">' +
                                '<a href="edit.html?channel_id={{channel.channel_id}}"><span class="glyphicon glyphicon-pencil"></span></a>' +
                                '<a ng-click="openDeleteChannelDialog(channel)"><span class="glyphicon glyphicon-trash"></span></a>' +
                              '</div>' +
                              '<div ng-if="admin_section === \'moderated_channels\'">' +
                                '<a href="moderate.html?channel_id={{channel.channel_id}}"><span class="glyphicon glyphicon-pencil"></span></a>' +
                              '</div>' +                              
                            '</div>' +
                          '</div>' +
                          '<div class="channel-item-description col-xs-12">' +
                            '<div class="well" ng-bind="channel.description"></div>' +
                          '</div>' +
                          '<div class="channel-item-bottom col-xs-12">' +
                            'Created <span am-time-ago="channel.added"></span>' +
                            'ChanOp <span class="blue user-name" ng-bind="channel.user_id"></span>' +
                          '</div>' +
                      '</div>' +
                    '</div>'

    return {
      restrict: 'AE',
      replace:true,
      controller: controller,
      template:template
    }

  }
]);            