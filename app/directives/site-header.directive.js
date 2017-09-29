app.directive('siteHeader', ['$rootScope',
	function($rootScope) {

		// site header controller
		var controller = function($scope,$element) {
		
			// init layout preview view
			$scope.initLayoutPreviewView = function(){
				$scope.layoutPreview = true;
				$scope.topicSortMenu();
			};

			// init site header
			$scope.init = function () {
				// meta links menu
				$scope.metaLinksMenu();
				// sort menus
				if ($scope.view === 'main' || $scope.view === 'channel'){
					$scope.topicSortMenu();
				} else if ($scope.view === 'channels'){
					$scope.channelSortMenu();
				}
			};

			// meta links menu
			$scope.metaLinksMenu = function() {
				$scope.links = [{
					title:'Test Channel',
					link:'/'+$scope.page.site_info.address + '/index.html?view:channel+channel_id=1R67TfYzNkCnh89EFfGmXn5LMb4hXaMRQ3'
				},{
					title:'Suggestions',
					link:'/'+$scope.page.site_info.address + '/index.html?view:channel+channel_id=1C1gnFcVv9J9kUjF4odDMRYcEWVPJbbqFp4'
				},{
					title:'中文频道',
					link:'/'+$scope.page.site_info.address + '/index.html?view:channel+channel_id=17vKbxL13KnzGATstqawXSG2oiQygmdkcX1'
				},{
					title:'Russian',
					link:'/'+$scope.page.site_info.address + '/index.html?view:channel+channel_id=1PniNzyi8fygvwyBaLpA9oBDVWZ5fXuJUw1'
				},{
					title:'Wallpapers',
					link:'/'+$scope.page.site_info.address + '/index.html?view:channel+channel_id=1DpPY5S6HpxsK6CQGWKZbKh9gVo1LnXze11'
				}]
			};

			// topic sort menu
			$scope.topicSortMenu = function() {
				$scope.sort = {
					options:[{
						name:'New',
						val:'-added',
						orderBy:'-added'
					},{
						name:'Top',
						val:'v.diff desc, t.topic_id',
						orderBy:'-votes_sum'
					}]
				};
			};

			// sort topics
			$scope.sortTopics = function(option){
				$rootScope.$broadcast('sortTopics',option);
			};

		    // channel sort menu
		    $scope.channelSortMenu = function(){
				// sort options
				$scope.sort = {
					options:[{
					name:'Number of topics',
					val:'-topics_total'
					},{
					name:'Last activity',
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

		};

		var template =  '<header ng-if="page && view" id="top" ng-init="init()">' +
							'<div class="meta-header">' +
								'<a ng-repeat="link in links" href="{{link.link}}">{{link.title}}</a>' +
								'<span style="margin-right: 115px;margin-top: 2px;" ng-if="page" feed-follow ng-init="initMainFollow()" class="rss-feed">' +
									'<a ng-if="!is_main_follow" ng-click="followNewTopics()"><i class="fa fa-rss" aria-hidden="true"></i>Follow</a>' +
									'<a ng-if="is_main_follow" class="active" ng-click="unfollowNewTopics()"><i class="fa fa-rss" aria-hidden="true"></i>Unfollow</a>' +
								'</span>' +
							'</div>' + 
						    '<nav class="navbar navbar-default navbar-fixed-top">' +
							    '<section class="navbar-container-top">' +
							    	'<div class="row">' +
								    	'<div class="header-left" style="padding:0;" ng-class="[{\'col-sm-9 col-xs-9\': layoutPreview},{\'col-sm-6 col-xs-6\': !layoutPreview}]" layout="row">' +
								    		'<div class="logo-section" layout="row">' + 
								    			'<div flex="100" class="logo-section-top">' + 
									    			'<h2 style="margin-bottom:0;padding-bottom:0;"><a href="/{{page.site_info.address}}/">{{page.site_info.content.title}}</a></h2>' +
									    			'<span class="channel-name" ng-if="channel">' +
									    				'<a href="index.html?view:channel+channel_id={{channel.channel_id}}">/{{channel.name}}</a>' +
														'<span ng-if="page" feed-follow ng-init="initChannelFollow(channel)" class="rss-feed">' +
															'<a ng-if="!is_channel_follow" ng-click="followChannel(channel)"><i class="fa fa-rss" aria-hidden="true"></i>Follow channel</a>' +
															'<a ng-if="is_channel_follow" class="active" ng-click="unfollowChannel(channel)"><i class="fa fa-rss" aria-hidden="true"></i>Unfollow channel</a>' +
														'</span>' +									    				
									    			'</span>' +
									    		'</div>' +
									    		'<span flex="100" style="clear:both;float: left;">{{page.site_info.content.description}}</span>' + 
								    		'</div>' +
								    	'</div>' +
								    	'<ul class="col-xs-3" ng-if="view !== \'channels\'">' +
								    		'<li ng-if="view === \'main\' ||view === \'channel\'" ng-repeat="option in sort.options">' + 
									    		'<a ng-click="sortTopics(option)">' + 
									    			'<button class="btn btn-primary">{{option.name}}</button>' +
									    		'</a>' +
								    		'</li>' +
								    		'<li ng-if="view === \'channel\'" ng-show="page.site_info.cert_user_id">' + 
									    		'<a href="index.html?view:new+section:topic+channel_id={{channel.channel_id}}">' + 
									    			'<button class="btn btn-primary">New Topic</button>' +
									    		'</a>' +
								    		'</li>' +
								    	'</ul>' +
								    	'<div class="col-xs-6 sort-channels" ng-if="view === \'channels\' && !layoutPreview">' +
								    	    '<label>SORT:</label>' + 
                            				'<select class="form-control" ng-model="sort.current" value="sort.current.name" ng-options="s_option.name for s_option in sort.options"></select>' +
								    	'</div>' +
								    	'<div class="col-xs-3" ng-if="!layoutPreview">' +
								    		'<user-menu></user-menu>' +
								    	'</div>' +
							    	'</div>' +
							    '</section>' +
						    '</nav>' +
						'</header>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);