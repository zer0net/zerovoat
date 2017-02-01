app.directive('siteHeader', ['$rootScope',
	function($rootScope) {

		// topic list controller
		var controller = function($scope,$element) {
			
			$scope.init = function () {
				// site menu
				if ($scope.section === 'main' || $scope.section === 'channel'){
					$scope.sortMenu();
				}
			};

			// site menu
			$scope.sortMenu = function() {
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

		};

		var template =  '<header ng-if="page" id="top">' +
						    '<nav class="navbar navbar-default navbar-fixed-top" ng-init="init()">' +
							    '<section class="navbar-container-top">' +
							    	'<div class="row">' +
								    	'<div class="col-xs-5 header-left" layout="row">' +
								    		'<img src="assets/img/logo.png"/>' +
								    		'<div class="logo-section" layout="row">' + 
								    			'<div flex="100" class="logo-section-top">' + 
									    			'<h2 style="margin-bottom:0;padding-bottom:0;"><a href="/{{page.site_info.address}}/">{{site_title}}</a></h2>' +
									    			'<span class="channel-name" ng-if="channel"><a href="index.html?channel_id={{channel.channel_id}}">/{{channel.name}}</a></span>' +
									    		'</div>' +
									    		'<span flex="100" style="clear:both;float: left;">{{site_slogan}}</span>' + 
								    		'</div>' +
								    	'</div>' +
								    	'<ul class="col-xs-3">' +
								    		'<li ng-repeat="option in sort.options" ng-if="section === \'main\' || section === \'channel\'">' + 
									    		'<a ng-click="sortTopics(option)">' + 
									    			'<button class="btn btn-primary">{{option.name}}</button>' +
									    		'</a>' +
								    		'</li>' +
								    		'<li ng-if="section === \'channel\' && channel" ng-show="page.site_info.cert_user_id">' + 
									    		'<a href="new.html?topic+channel_id={{channel.channel_id}}">' + 
									    			'<button class="btn btn-primary">New Topic</button>' +
									    		'</a>' +
								    		'</li>' +
								    		'<li ng-if="section === \'channels\'" ng-if="page.site_info.cert_user_id">' + 
									    		'<a href="new.html?channel">' + 
									    			'<button class="btn btn-primary">Create Channel</button>' +
									    		'</a>' +
								    		'</li>' +
								    	'</ul>' +
								    	'<div class="col-xs-4">' +
									    	'<div class="user-menu" ng-init="getUserInfo()" ng-if="page.site_info.cert_user_id">' +
										    	'<div ng-if="!loading">' +
										    		'<span ng-bind="user.user_id" class="blue user-name"></span>' +
										    		'<span>| <a title="channels" href="user-admin.html?section=my_channels"><span class="glyphicon glyphicon-book"></span> [{{user.channelsCount}}]</a></span>' +
										    		'<span>| <a title="topics" href="user-admin.html?section=topics"><span class="glyphicon glyphicon-file"></span> [{{user.topicsCount}}]</a></span>' +
										    		'<span>| <a title="comments" href="user-admin.html?section=comments"><span class="glyphicon glyphicon-comment"></span> [{{user.commentsCount}}]</a></span>' +
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