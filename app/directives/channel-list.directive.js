app.directive('channelList', [
  function() {

    // channel list controller
    var controller = function($scope,$element) {
      // get topic comments
      $scope.getChannelsTopics = function(channel) {
        var query = ["SELECT * FROM topic WHERE channel_id='"+channel.channel_id+"'"];
        Page.cmd("dbQuery", query, function(topics) {
          $scope.$apply(function(){
            // last post date
            channel.last_topic_date = 0;
            topics.forEach(function(topic,index){
              if (topic.added > channel.last_topic_date){
                channel.last_topic_date = topic.added;
              }
            });
            // total topics
            channel.topics_total = topics.length;
            // topics array
            channel.topics = topics;
          });
        });    
      };

      // render channel list item
      $scope.renderChannelListItem = function(channel){
        channel.user_name = channel.user_id.split('@')[0];
      };

    };

    var template =  '<section class="channel-view-container">' +
                      '<div class="channel-list col-sm-9 col-xs-12" ng-init="initChannelsSort()">' +
                        '<div ng-repeat="channel in channels | orderBy:sort.current.val" class="channel-item col-xs-12" ng-init="getChannelsTopics(channel)">' +
                            '<div class="channel-item-wrap" ng-init="renderChannelListItem(channel)">' +
                              '<div class="channel-item-top col-xs-12">' +
                                '<h3><a href="/{{page.site_info.address}}/index.html?view:channel+channel_id={{channel.channel_id}}"><span>{{channel.name}}</span><small class="channel-topic-count">[{{channel.topics_total}}]</small></a></h3>' +
                                '<a href="/{{page.site_info.address}}/index.html?view:channel+channel_id={{channel.channel_id}}" class="btn-go">›</a>' +
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
                                '<article ng-bind="channel.description"></article>' +
                                '<span>ChanOp: <span class="blue user-name" ng-bind="channel.user_name"></span></span>' +
                              '</div>' +
                              '<div class="channel-item-bottom col-xs-12">' +
                                'Created <span am-time-ago="channel.added"></span>' +
                                '<span ng-if="channel.last_topic_date > 0" class="pull-right">Latest activity <span am-time-ago="channel.last_topic_date"></span></span>' +
                              '</div>' +
                            '</div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="channels-sidebar col-sm-3 col-xs-12">' +
                        '<sidebar></sidebar>' +
                      '</div>' + 
                    '</section>';

    return {
      restrict: 'AE',
      replace:true,
      controller: controller,
      template:template
    }

  }
]);            