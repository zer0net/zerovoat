app.directive('topicList', [
	function() {

		// topic list controller
		var controller = function($scope,$element) {
			
			$scope.init = function(){
				$scope.loading = true;				
				var query;
				// if front page
				if ($scope.section === 'main'){
					query = ["SELECT * FROM topic ORDER BY -added LIMIT 15"];
				} else {
					// if admin section
					if ($scope.admin_section){
						query = ["SELECT * FROM topic WHERE user_id='"+$scope.user.user_id+"' ORDER BY added"];
					} else {
						query = ["SELECT * FROM topic WHERE channel_id='"+$scope.channel.channel_id+"' ORDER BY added"];
					}
				}
				$scope.getTopicList(query);
			};

			// init channel topic list
			$scope.getTopicList = function(query){
				Page.cmd("dbQuery", query, function(topics) {
					$scope.$apply(function(){
						$scope.topics = topics;
						$scope.topics.forEach(function(topic,index){
							topic.user_name = topic.user_id.split('@')[0];
							$scope.getTopicChannel(topic,index);
						});
					});
				});
			};

			// init topic list item
			$scope.getTopicChannel = function(topic,index){
				var query = ["SELECT * FROM channel WHERE channel_id='"+topic.channel_id+"' ORDER BY added LIMIT 15"];
				Page.cmd("dbQuery", query, function(channel) {
					$scope.$apply(function(){
						topic.channel = channel[0];
						if ((index + 1) === $scope.topics.length){
							$scope.loading = false;
						}
					});
				});
			};

			// toggle topic body
			$scope.toggleTopicBody = function(topic) {
				if (topic.show_body === true){
					topic.show_body = false;
					topic.toggleClass = '';
				} else if (topic.show_body === false || !topic.show_body){
					topic.show_body = true;
					topic.toggleClass = 'collapse';
				}				
			};

		};

		// topic list template
		var template = '<section id="topic-list" ng-init="init()">' +
							'<!-- loading -->' +
						    '<span ng-show="loading" class="loader col-xs-12"></span>' +
						    '<!-- /loading -->' +
						    '<div ng-repeat="topic in topics | orderBy:\'-added\'" ng-show="topic.visible" class="topic-item row" moderations ng-init="getItemModerations(topic)">' +
								'<div class="topic-item-left votes" votes ng-init="getTopicVotes(topic)">' +
									'<a ng-click="onUpVoteTopic(topic)" class="vote-arrow arrow-up"></a>' +
									'<span class="votes-sum-total">{{topic.votes_sum}}</span>' +
									'<a ng-click="onDownVoteTopic(topic)" class="vote-arrow arrow-down"></a>' +
									'<div class="votes-bar">' +
									  '<span class="up-vote-bar" style="height:{{topic.uvp}}%;"></span>' +
									  '<span class="down-vote-bar" style="height:{{topic.dvp}}%;"></span>' +
									'</div>' +
								'</div>' +
							    '<div class="topic-item-main {{topic.body_class}}" files ng-init="getItemFile(topic)">' +
								    '<div class="topic-item-image">'+
								        '<figure><a href="topic.html?topic_id={{topic.topic_id}}" ng-if="topic.image"><img ng-src="{{topic.image_path}}"/></a></figure>' +
								    '</div>' +
								    '<div class="topic-item-body">' +
								      	'<div class="topic-item-header">' +
								        	'<h3><a href="topic.html?topic_id={{topic.topic_id}}">{{topic.title}}</a></h3>' +
								        	'<div ng-if="view === \'moderate\'" class="topic-moderation-menu">'+
								        		'visible:{{topic.moderation.visible}}'+
								        		'<a ng-click="toggleTopicVisibility(topic)">' +
								        			'<span ng-class="[{\'glyphicon glyphicon-eye-open\': topic.visible === 1 || topic.moderation.visible === 1},{\'glyphicon glyphicon-eye-close\': topic.moderation.visible === 0}]"></span>' + 
								        		'</a>' +
								        		'<a href="/{{page.site_info.address}}/moderate.html?topic_id={{topic.topic_id}}"><span class="glyphicon glyphicon-pencil"></span></a>' +						        		
								        	'</div>' +
								      	'</div>' +
								        '<div class="topic-info in-list">' +
								          '<a class="toggle-btn {{topic.toggleClass}}" ng-click="toggleTopicBody(topic)"></a>' +
								          'submitted <span am-time-ago="topic.added"></span> ' +
								          'by <span class="user-name blue" ng-bind="topic.user_name"></span> ' +
								          'to <a href="?channel_id={{topic.channel.channel_id}}">{{topic.channel.name}}</a>' +
								          ' (<span class="votes-up">+{{topic.votes_up}}</span><b>|</b><span class="votes-down">-{{topic.votes_down}}</span>)' +
								        '</div>' +
								        '<div class="topic-bottom"> ' +
								          '<a href="topic.html?topic_id={{topic.topic_id}}#comment-list"><b comments ng-init="countTopicComments(topic)">{{topic.comments_total}} comments</b></a>' +
								        '</div>' +
								        '<div class="topic-body" ng-show="topic.show_body">' +
								          '<article ng-if="topic.body" ng-bind="topic.body"></article>' +
									      '<figure ng-if="topic.image"><img ng-src="{{topic.image_path}}"/></figure>' +
									      '<div ng-if="topic.video"><video-player ng-init="initVideoPlayer(topic.player)"></video-player></div>' +
								        '</div>' +
								    '</div>' +
							    '</div>' +
						    '</div>' +
						'</section>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);