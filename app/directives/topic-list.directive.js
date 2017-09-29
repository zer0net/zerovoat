app.directive('topicList', ['$rootScope','$location','Item',
	function($rootScope,$location,Item) {

		// topic list controller
		var controller = function($scope,$element) {
			
			// init topic list
			$scope.init = function(){
				// loading
				$scope.topics_loading = true;
				// sort
				$scope.sort = Item.generateListSorting($location.$$absUrl);
				// paging
				$scope.paging = Item.generateListPaging($location.$$absUrl);
				// generate query
				$scope.generateQuery();
			};

			// generate query
			$scope.generateQuery = function(){				
				// generate topic count query
				$scope.count_query = Item.generateTopicCountQuery($scope.view,$scope.user,$scope.channel);
				// generate topic list query
				$scope.query = Item.generateTopicListQuery($scope.paging,$scope.sort,$scope.view,$scope.user,$scope.channel);
				// count topics
				$scope.countTopics($scope.query);
			};

			// count topics
			$scope.countTopics = function(){
				Page.cmd("dbQuery",$scope.count_query, function(topic_count){
					$scope.$apply(function(){
						// total items
						$scope.paging.totalItems = topic_count[0]['count(*)'];
						$scope.paging.numPages = Math.ceil($scope.paging.totalItems / $scope.paging.itemsPerPage);
						// get topics
						$scope.getTopics();
					});
				});
			};

			// get topics
			$scope.getTopics = function(query){
				Page.cmd("dbQuery", $scope.query, function(topics) {
					$scope.$apply(function(){
						// $scope.topics = Item.renderTopicList(topics,$scope.page.site_info.address,$scope.section,$scope.site_files,$scope.config,$scope.sites);
						$scope.topics = topics;
						// $scope.img_total = Item.countTopicsWithImages($scope.topics);
						$scope.topics_loading = false;
					});
				});
			};

			$scope.topicImageLoaded = function(topic){
				$scope.img_counter+=1;
				if ($scope.img_counter === $scope.img_total){
					$scope.finishTopicsLoading();
				}
			};

			// finish loading topics
			$scope.finishTopicsLoading = function(){
				$scope.topics_loading = false;
			};

			// page change
			$scope.pageChanged = function(){
				$scope.topics_loading = true;
				$scope.generateQuery();
			};

			// on sort topics
			$rootScope.$on('sortTopics',function(event,mass){
				$scope.topics_loading = true;
				$scope.sort = mass;
				$scope.generateQuery();
			});

		};

		// topic list template
		var template = '<section id="topic-list" ng-init="init()">' +
							'<section ng-hide="topics_loading">' +
								'<!-- sticky topic -->' +
								'<topic-list-item ng-if="sticky_topic" ng-init="setTopic(sticky_topic)"></topic-list-item>' +
							    '<!-- /sticky topic -->' +
							    '<topic-list-item ng-repeat="topic in topics" ng-show="topic.visible" ng-if="topic.topic_id !== sticky_topic.topic_id"></topic-list-item>' +
							    '<ul ng-if="paging.numPages > 1" class="topic-list-navigation">' +
							    	'<li ng-if="paging.currentPage > 1"><a href="/{{page.site_info.address}}/index.html?view:main+page={{paging.currentPage - 1}}+sort={{sort.orderBy}}">Prev</a></li>' +
							    	'<li ng-if="paging.numPages > paging.currentPage"><a href="/{{page.site_info.address}}/index.html?view:main+page={{paging.nextPage}}+sort={{sort.orderBy}}">Next</a></li>' +
							    '</ul>' +
							    '<div layout="row" flex="100" ng-if="topics.length === 0">' +
							    	'<span>no topics yet, <a href="/{{page.site_info.address}}/index.html?view:new+section:topic+channel_id={{channel.channel_id}}">create a new topic!</span>' +
							    '</div>' +
						    '</section>' +
						    '<span class="loader" ng-show="topics_loading"></span>' +
						'</section>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);