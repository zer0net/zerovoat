app.directive('channelList', [
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
      // render channel list item
      $scope.renderChannelListItem = function(channel){
        console.log(channel);
        channel.user_name = channel.user_id.split('@')[0];
      };
    };

    var template =  '<div class="channel-list col-lg-12">' +
                      '<div ng-repeat="channel in channels" class="channel-item col-xs-6 col-sm-4 col-md-3" ng-init="countChannelTopics(channel)">' +
                          '<div class="channel-item-wrap" ng-init="renderChannelListItem(channel)">' +
                            '<div class="channel-item-top col-xs-12">' +
                              '<h3><a href="/{{page.site_info.address}}/?channel_id={{channel.channel_id}}"><span>{{channel.name}}</span><small class="channel-topic-count">[{{channel.topics_total}}]</small></a></h3>' +
                              '<a href="/{{page.site_info.address}}/?channel_id={{channel.channel_id}}" class="btn-go">›</a>' +
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
                            '<div class="channel-item-bottom col-xs-12">' +
                              'Created <span am-time-ago="channel.added"></span><br/>' +
                              '<span class="blue user-name" ng-bind="channel.user_name"></span>' +
                            '</div>' +
                            '<div class="channel-item-description col-xs-12">' +
                              '<article ng-bind="channel.description"></article>' +
                            '</div>' +
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