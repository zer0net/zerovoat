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

      // init sort menu option
      $scope.initChannelsSort = function(){
        // sort options
        $scope.sort = {
          options:[{
            name:'Number of topics',
            val:'-topics_total'
          },{
            name:'Last topic',
            val:'-last_topic_date'
          },{
            name:'A - Z',
            val:'name'
          },{
            name:'Newest',
            val:'-added'
          },{
            name:'Oldest',
            val:'added'
          }]
        };
        // set default sort option
        $scope.sort.current = $scope.sort.options[0];
      };

      // render channel list item
      $scope.renderChannelListItem = function(channel){
        channel.user_name = channel.user_id.split('@')[0];
      };

    };

    var template =  '<div class="channel-list col-lg-12" ng-init="initChannelsSort()">' +
                      '<div class="channel-list-counter">' +
                        '<div class="pull-right col-xs-4" style="padding-right: 0;margin-bottom: 2px;">' +
                          '<label>SORT BY : </label>' + 
                          '<select class="form-control" ng-model="sort.current" value="sort.current.name" ng-options="s_option.name for s_option in sort.options"></select>' +
                        '</div>' +
                        '<p style="float:right; text-align:right; text-transform:uppercase:">number of channels : {{channels.length}}</p>' + 
                      '</div>' +
                      '<div ng-repeat="channel in channels | orderBy:sort.current.val" class="channel-item col-xs-6 col-sm-4 col-md-3" ng-init="getChannelsTopics(channel)">' +
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
                            '<div class="channel-item-description col-xs-12">' +
                              '<article ng-bind="channel.description"></article>' +
                            '</div>' +
                            '<div class="channel-item-bottom col-xs-12">' +
                              'Created <span am-time-ago="channel.added"></span><br/>' +
                              '<span class="blue user-name" ng-bind="channel.user_name"></span>' +
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