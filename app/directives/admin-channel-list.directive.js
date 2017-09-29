app.directive('adminChannelList', ['Channel',
  function(Channel) {

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

    var template =  '<div class="admin-channel-list row" ng-init="getUserChannels()">' +
                      '<div ng-repeat="channel in channels" class="channel-item" ng-init="countChannelTopics(channel)">' +
                          '<div class="channel-item-top col-xs-12">' +
                            '<h3>' +
                              '<a href="/{{page.site_info.address}}/index.html?view:channel+channel_id={{channel.channel_id}}">' +
                                '{{channel.name}} <small class="channel-topic-count">[{{channel.topics_total}}]</small>' +
                              '</a>' +
                            '</h3>' +
                            '<item-edit-toolbar ng-init="setItem(channel)"></item-edit-toolbar>' +
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