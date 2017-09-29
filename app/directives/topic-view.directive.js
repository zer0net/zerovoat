app.directive('topicView', ['$rootScope','$location',
	function($rootScope,$location) {

		// topic view controller
		var controller = function($scope,$element) {
			
			// init topic view
			$scope.initTopicView = function(){
				if ($location.$$absUrl.indexOf('rn_id=') > -1){
					$rootScope.$broadcast('readNotification');
				}
				if ($location.$$absUrl.indexOf('comment=') > -1){
					$scope.comment_id = $location.$$absUrl.split('comment=')[1];
					if ($scope.comment_id.indexOf('&') > 1){
						$scope.comment_id = $scope.comment_id.split('&')[0];
						var hash = 'comment-'+$scope.comment_id;
						$scope.scrollToLocation(hash);
					}
				}
			};
			
			// on img load
			$scope.onImgLoad = function(topic){
				topic.img_loaded = 'loaded';
			};

		};

		var template =  '<section ng-if="topic" ng-init="initTopicView()" ng-hide="loading" id="topic-view" class="main-content fg-color col-xs-12">' +
							'<!-- topic -->' +
							'<div class="topic-item">' +
							    '<div class="topic-item-left votes" votes ng-init="getTopicVotes(topic)" ng-class="userVoteCss(topic.vote_user)">' +
									'<a ng-click="onUpVoteTopic(topic)" class="vote-arrow arrow-up"></a>' +
									'<span class="votes-sum-total">{{topic.votes_sum}}</span>' +
									'<a ng-click="onDownVoteTopic(topic)" class="vote-arrow arrow-down"></a>' +
									'<div class="votes-bar">' +
										'<span class="up-vote-bar" style="height:{{topic.uvp}}%;"></span>' +
										'<span class="down-vote-bar" style="height:{{topic.dvp}}%;"></span>' +
									'</div>' +
							    '</div>' +
							    '<div files ng-init="getItemFile(topic)" class="topic-item-body col-xs-12">' +
								    '<div class="topic-header">' +
								        '<h3>' +
								        	'<a href="index.html?view:topic+topic_id={{topic.topic_id}}">{{topic.title}}</a>' +
											'<span ng-if="page" feed-follow ng-init="initTopicFollow(topic)" class="rss-feed">' +
												'<a ng-if="!is_topic_follow" ng-click="followTopic(topic)"><i class="fa fa-rss" aria-hidden="true"></i>Follow topic</a>' +
												'<a ng-if="is_topic_follow" class="active" ng-click="unfollowTopic(topic)"><i class="fa fa-rss" aria-hidden="true"></i>Unfollow topic</a>' +
											'</span>' +	
								        '</h3>' +
								        '<div class="topic-info">' +
								          'submitted <span am-time-ago="topic.added"></span> ' +
								          'by <span class="user-name blue">{{topic.user_id.split(\'@\')[0]}}</span> ' +
								          'to <b><a href="index.html?channel_id={{topic.channel_id}}" ng-bind="topic.name"></a></b> ' +
								          '(<span class="votes-up">+{{topic.votes_up}}</span><b>|</b><span class="votes-down">-{{topic.votes_down}}</span>)' +
								        '</div>' +
								    '</div>' +
								    '<div class="topic-body" ng-if="topic.body">' +
								        '<article class="fg-color-secondary">' +
								          '<div contenteditable="false" ta-bind="ta-bind" ng-model="topic.body"></div>' +
								        '</article>' +
								    '</div>' +
								    '<topic-media-item ng-init="renderTopicMediaItem(topic)"></topic-media-item>' +
								    '<item-embed ng-if="topic.embed_url" ng-init="initItemEmbed(topic)"></item-embed>' +
								    '<div class="topic-bottom"> ' +
								        '<b>{{topic.comments_total - topic.hidden_comments_total}} comments</b> ' +
								    '</div>' +
							    '</div>' +
							'</div>' +
							'<!-- /topic -->' +
							'<!-- topic comments -->' +
							'<topic-comments></topic-comments>' +
							'<!-- /topic comments -->' +
						'</section>';
		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);