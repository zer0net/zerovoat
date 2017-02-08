app.directive('siteHeader', ['$rootScope',
	function($rootScope) {

		// topic list controller
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
				if ($scope.section === 'main' || $scope.section === 'channel'){
					$scope.topicSortMenu();
				} else if ($scope.section === 'channels'){
					$scope.channelSortMenu();
				}
			};

			// get user info
			$scope.getUserInfo = function() {
				$scope.loading = true;
				// user obj
				$scope.user = { user_id: $scope.page.site_info.cert_user_id.split('@')[0] };
				// get user			
				var query = ["SELECT * FROM user WHERE user_id='"+$scope.page.site_info.auth_address+"'"];
				Page.cmd("dbQuery",query, function(user) {
					$scope.$apply(function() {
						if (user.length < 1){
							// register user
							$scope.registerUser();
						} else {
							// count User Items
							$scope.countUserItems();
						}
					});
				});
			};

			// register user
			$scope.registerUser = function() {
				// inner path to user's data.json file
				var inner_path = 'data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.user){
							data.user = [];
						}
					} else { 
						data = { 
							user:[] 
						}; 
					}
					var user = {
						user_id:$scope.page.site_info.auth_address,
						user_name:$scope.page.site_info.cert_user_id,
						added:+(new Date)
					};
					// add user to user's json
					data.user.push(user);
					// write to file
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						console.log(res);
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							console.log(res);
							// apply to scope
							$scope.$apply(function() {
								Page.cmd("wrapperNotification", ["done", "User Registered!", 10000]);
								$scope.countUserItems();
							});
						});
					});
				});				
			};

			// count user items
			$scope.countUserItems = function() {
				// count channels
				var query = ["SELECT count(*) FROM channel WHERE user_id='"+$scope.page.site_info.cert_user_id+"'"];
				Page.cmd("dbQuery", query, function(channelsCount) {
					$scope.user.channelsCount = channelsCount[0]['count(*)'];
					// count topics
					var query = ["SELECT count(*) FROM topic WHERE user_id='"+$scope.page.site_info.cert_user_id+"'"];
					Page.cmd("dbQuery", query, function(topicsCount) {
						$scope.user.topicsCount = topicsCount[0]['count(*)'];
						// count comments
						var query = ["SELECT count(*) FROM comment WHERE user_id='"+$scope.page.site_info.cert_user_id+"'"];
						Page.cmd("dbQuery", query, function(commentsCount) {
							$scope.user.commentsCount = commentsCount[0]['count(*)'];
							// finish loading
							$scope.loading = false;
							// apply to scope
							$scope.$apply();
						});
					});
				});				
			};

			// meta links menu
			$scope.metaLinksMenu = function() {
				$scope.links = [{
					title:'ZeroNet',
					link:'/'+$scope.page.site_info.address + '/?channel_id=1R67TfYzNkCnh89EFfGmXn5LMb4hXaMRQ2'
				},{
					title:'Politics',
					link:'/'+$scope.page.site_info.address + '/?channel_id=1R67TfYzNkCnh89EFfGmXn5LMb4hXaMRQ1'
				},{
					title:'Russian',
					link:'/'+$scope.page.site_info.address + '/?channel_id=1PniNzyi8fygvwyBaLpA9oBDVWZ5fXuJUw1'
				},{
					title:'Wallpapers',
					link:'/'+$scope.page.site_info.address + '/?channel_id=1DpPY5S6HpxsK6CQGWKZbKh9gVo1LnXze11'
				}]
			};

			// topic sort menu
			$scope.topicSortMenu = function() {
				$scope.sort = {
					options:[{
						name:'New',
						val:'-added'
					},{
						name:'Top',
						val:'-votes_sum'
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

		};

		var template =  '<header ng-if="page" id="top" ng-init="init()">' +
							'<div class="meta-header">' +
								'<a ng-repeat="link in links" href="{{link.link}}">{{link.title}}</a>' +
							'</div>' + 
						    '<nav class="navbar navbar-default navbar-fixed-top">' +
							    '<section class="navbar-container-top">' +
							    	'<div class="row">' +
								    	'<div class="header-left" ng-class="[{\'col-xs-9\': layoutPreview},{\'col-xs-6\': !layoutPreview}]" layout="row">' +
								    		'<img src="assets/img/logo.png"/>' +
								    		'<div class="logo-section" layout="row">' + 
								    			'<div flex="100" class="logo-section-top">' + 
									    			'<h2 style="margin-bottom:0;padding-bottom:0;"><a href="/{{page.site_info.address}}/">{{site_title}}</a></h2>' +
									    			'<span class="channel-name" ng-if="channel"><a href="index.html?channel_id={{channel.channel_id}}">/{{channel.name}}</a></span>' +
									    		'</div>' +
									    		'<span flex="100" style="clear:both;float: left;">{{site_slogan}}</span>' + 
								    		'</div>' +
								    	'</div>' +
								    	'<ul class="col-xs-3" ng-if="section !== \'channels\'">' +
								    		'<li ng-if="section === \'main\' || section === \'channel\'" ng-repeat="option in sort.options">' + 
									    		'<a ng-click="sortTopics(option)">' + 
									    			'<button class="btn btn-primary">{{option.name}}</button>' +
									    		'</a>' +
								    		'</li>' +
								    		'<li ng-if="section === \'channel\'" ng-show="page.site_info.cert_user_id">' + 
									    		'<a href="new.html?topic+channel_id={{channel.channel_id}}">' + 
									    			'<button class="btn btn-primary">New Topic</button>' +
									    		'</a>' +
								    		'</li>' +
								    	'</ul>' +
								    	'<div class="col-xs-3 sort-channels" ng-if="section === \'channels\' && !layoutPreview">' +
								    	    '<label>SORT:</label>' + 
                            				'<select class="form-control" ng-model="sort.current" value="sort.current.name" ng-options="s_option.name for s_option in sort.options"></select>' +
								    	'</div>' +
								    	'<div class="col-xs-3" ng-if="!layoutPreview">' +
									    	'<div class="user-menu fg-color-secondary" ng-init="getUserInfo()" ng-if="page.site_info.cert_user_id">' +
										    	'<div ng-if="!loading">' +
										    		'<span ng-bind="user.user_id" class="blue user-name"></span>' +
										    		'<span>| <a title="channels" href="user-admin.html?section=my_channels"><span class="glyphicon glyphicon-book"></span> [{{user.channelsCount}}]</a></span>' +
										    		'<span>| <a title="topics" href="user-admin.html?section=topics"><span class="glyphicon glyphicon-file"></span> [{{user.topicsCount}}]</a></span>' +
										    		'<span>| <a title="logout" ng-click="selectUser()">logout</a></span>' +
										    	'</div>' +
										    	'<span class="loader" ng-if="loading"></span>' +
									    	'</div>' +
									    	'<div class="user-menu" ng-if="!page.site_info.cert_user_id">' +
									    		'<span><a ng-click="selectUser()">login</a> to participate</span>' +
									    	'</div>' +
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