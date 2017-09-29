app.directive('feedFollow', ['Follow',
  function(Follow) {

    // feed follow controller
    var controller = function($scope,$element) {

      /* INIT */

        // init main follow
        $scope.initMainFollow = function(){
          $scope.is_main_follow = false;
          if ($scope.page.feed){
            for (var i in $scope.page.feed){
              if (i === "New topics"){
                $scope.is_main_follow = true;
              }
            }
          } else {
            $scope.is_main_follow = false;
          }
        };

        // init channel follow
        $scope.initChannelFollow = function(channel){
          $scope.is_channel_follow = false;
          if ($scope.page.feed){
            for (var i in $scope.page.feed){
              if (i === channel.channel_id + " channel"){
                $scope.is_channel_follow = true;
              }
            }
          } else {
            $scope.is_channel_follow = false;
          }
        };

        // init channel follow
        $scope.initTopicFollow = function(topic){
          $scope.is_topic_follow = false;
          if ($scope.page.feed){
            for (var i in $scope.page.feed){
              if (i === topic.topic_id + " topic"){
                $scope.is_topic_follow = true;
              }
            }
          } else {
            $scope.is_topic_follow = false;
          }
        };

      /* /INIT */

      /* FOLLOW */

        // follow new topics
        $scope.followNewTopics = function(){
          var params;
          var query = Follow.generateFollowNewTopicsQuery();
          var feed = [query,params];
          var title = "New topics";
          $scope.is_main_follow = true;        
          $scope.addFeed(feed,title);
        };

        // follow channel
        $scope.followChannel = function(channel){
          var params;
          var query = Follow.generateFollowChannelQuery(channel);
          var feed = [query,params];
          var title = channel.channel_id + " channel";
          $scope.is_channel_follow = true;
          $scope.addFeed(feed,title);
        };

        // follow topic
        $scope.followTopic = function(topic){
          var params;
          var query = Follow.generateFollowTopicCommentsQuery(topic);
          var feed = [query,params];
          var title = topic.topic_id + " topic";
          $scope.is_topic_follow = true;
          $scope.addFeed(feed,title);
        };

      /* /FOLLOW */

      /* UNFOLLOW */

        // unfollow new topics
        $scope.unfollowNewTopics = function(){
          var title = "New topics";
          $scope.is_main_follow = false;
          $scope.removeFeed(title);
        };
        
        // unfollow channel
        $scope.unfollowChannel = function(channel){
          var title = channel.channel_id + " channel";
          $scope.is_channel_follow = false;
          $scope.removeFeed(title);
        };

        // unfollow channel
        $scope.unfollowTopic = function(topic){
          var title = topic.topic_id + " topic";
          $scope.is_topic_follow = false;
          $scope.removeFeed(title);
        };

      /* /UNFOLLOW */

      /** FEED **/

      // add feed
      $scope.addFeed = function(feed,title){
        if (!$scope.page.feed) $scope.page.feed = {};
        $scope.page.feed[title] = feed;
        Page.cmd("feedFollow",[$scope.page.feed]);
      };

      // remove feed
      $scope.removeFeed = function(title){
        delete $scope.page.feed[title];
        Page.cmd("feedFollow",[$scope.page.feed]);
      };

      /** /FEED **/

    };

    return {
      restrict: 'AE',
      replace:false,
      controller: controller
    }

  }
]);            