app.directive('topicList', ['$rootScope','$location',
	function($rootScope,$location) {

		// topic list controller
		var controller = function($scope,$element) {
			
			// init topic list
			$scope.init = function(){

				// loading
				$scope.loading = true;

				// default sort options
				$scope.sort = {
					name:'New',
					val:'-added'
				};
				
				// paging
				$scope.paging = { 
					itemsPerPage:20,
				};				

				// current page
				var currentPage = $location.$$absUrl.split('&')[0].split('page=')[1];				
				if (currentPage){
					$scope.paging.currentPage = currentPage
				} else {
					$scope.paging.currentPage = 1;
				}

				// next page
				$scope.paging.nextPage = parseInt($scope.paging.currentPage) + 1;

				// generate query
				$scope.generateQuery();
				
			};

			// generate query
			$scope.generateQuery = function(){

				// if front page
				if ($scope.section === 'main'){
					$scope.query = ["SELECT * FROM topic ORDER BY -added LIMIT " + $scope.paging.itemsPerPage + " OFFSET " + $scope.paging.itemsPerPage * ($scope.paging.currentPage - 1)];
					$scope.count_query = ["SELECT COUNT(*) FROM topic ORDER BY -added"];
				} else {
					// if admin section
					if ($scope.admin_section){
						$scope.query = ["SELECT * FROM topic WHERE user_id='"+$scope.user.user_id+"' ORDER BY -added LIMIT " + $scope.paging.itemsPerPage + " OFFSET " + $scope.paging.itemsPerPage * ($scope.paging.currentPage - 1)];
						$scope.count_query = ["SELECT COUNT(*) FROM topic WHERE user_id='"+$scope.user.user_id+"' ORDER BY -added"];
					} else {
						$scope.query = ["SELECT * FROM topic WHERE channel_id='"+$scope.channel.channel_id+"' ORDER BY -added LIMIT " + $scope.paging.itemsPerPage + " OFFSET " + $scope.paging.itemsPerPage * ($scope.paging.currentPage - 1)];
						$scope.count_query = ["SELECT COUNT(*) FROM topic WHERE channel_id='"+$scope.channel.channel_id+"' ORDER BY -added"];
					}
				}
				// count topics
				$scope.countTopics($scope.query);
			};

			// count topics
			$scope.countTopics = function(query){
				Page.cmd("dbQuery",$scope.count_query, function(topic_count){
					// total items
					$scope.paging.totalItems = topic_count[0]['COUNT(*)'];
					$scope.paging.numPages = Math.ceil($scope.paging.totalItems / $scope.paging.itemsPerPage);
					// get topics
					$scope.getTopics(query);
				});
			};

			// get topics
			$scope.getTopics = function(query){
				Page.cmd("dbQuery", query, function(topics) {
					$scope.$apply(function(){
						$scope.topics = topics;
						$scope.loading = false;
					});
				});
			};

			// render topic list item
			$scope.renderTopicListItem = function(topic) {
				topic.user_name = topic.user_id.split('@')[0];
				if (!$scope.channel){
					$scope.getTopicChannel(topic);
				} else {
					topic.channel = $scope.channel;
				}
			};

			// get topic channel
			$scope.getTopicChannel = function(topic){
				var query = ["SELECT * FROM channel WHERE channel_id='"+topic.channel_id+"' ORDER BY added"];
				Page.cmd("dbQuery", query, function(channel) {
					$scope.$apply(function(){
						topic.channel = channel[0];
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

			// page change
			$scope.pageChanged = function(){
				$scope.generateQuery();
			};

			// on sort topics
			$rootScope.$on('sortTopics',function(event,mass){
				$scope.sort = mass;
			});

		};

		// topic list template
		var template = '<section id="topic-list" ng-init="init()">' +
						    '<div ng-repeat="topic in topics | orderBy:sort.val" ng-show="topic.visible" class="topic-item row" moderations ng-init="getItemModerations(topic)">' +
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
								    '<div class="topic-item-body" ng-init="renderTopicListItem(topic)">' +
								      	'<div class="topic-item-header">' +
								        	'<h3><a href="topic.html?topic_id={{topic.topic_id}}">{{topic.title}}</a></h3>' +
								        	'<div ng-if="view === \'moderate\' || view === \'edit\'" class="topic-moderation-menu">'+
								        		'<a ng-click="toggleTopicVisibility(topic)">' +
								        			'<span ng-class="[{\'glyphicon glyphicon-eye-open\': topic.visible === 1 || topic.moderation.visible === 1},{\'glyphicon glyphicon-eye-close\': topic.moderation.visible === 0}]"></span>' + 
								        		'</a>' +
								        		'<a ng-if="topic.user_id === page.site_info.cert_user_id" href="/{{page.site_info.address}}/moderate.html?topic_id={{topic.topic_id}}"><span class="glyphicon glyphicon-pencil"></span></a>' +						        		
								        	'</div>' +
								      	'</div>' +
								        '<div class="topic-info in-list subtext-color">' +
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
								          '<article ng-if="topic.body" ng-bind="topic.body" class="fg-color-secondary"></article>' +
									      '<figure ng-if="topic.image"><img ng-src="{{topic.image_path}}"/></figure>' +
									      '<div ng-if="topic.video"><video-player ng-init="initVideoPlayer(topic.player)"></video-player></div>' +
								        '</div>' +
								    '</div>' +
							    '</div>' +
						    '</div>' +
						    '<ul ng-if="paging.numPages > 1" class="topic-list-navigation">' +
						    	'<li ng-if="paging.currentPage > 1"><a href="/{{page.site_info.address}}/index.html?page={{paging.currentPage - 1}}">Prev</a></li>' +
						    	'<li ng-if="paging.numPages > paging.currentPage"><a href="/{{page.site_info.address}}/index.html?page={{paging.nextPage}}">Next</a></li>' +
						    '</ul>' +
						    '<div layout="row" flex="100" ng-if="topics.length === 0">' +
						    	'<span>no topics yet, <a href="/{{page.site_info.adderess}}/new.html?topic+channel_id={{channel.channel_id}}">create a new topic!</span>' +
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