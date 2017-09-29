app.directive('userMenu', ['User','Notification','$rootScope','$location',
	function(User,Notification,$rootScope,$location) {

		// user menu controller
		var controller = function($scope,$element) {
			// get user
			$scope.getUserInfo = function() {
				$scope.loading = true;
				// get user
				var query = User.generateUserQuery($scope.page.site_info.auth_address);
				Page.cmd("dbQuery",query, function(user) {
					$scope.$apply(function() {
						if (user.length < 1){
							// register user
							$scope.registerUser();
						} else {
							$scope.renderUser(user[0]);
						}
					});
				});
			};

			// render user
			$scope.renderUser = function(user){
				$scope.user = user;
				Page.cmd("dbQuery",["SELECT * FROM json"], function(jsons) {
					var userPath = User.findUserContentJsonDirectory(jsons,user.user_id);
					$scope.updateUserContentJson(userPath);
				});
			};

			// update user content json
			$scope.updateUserContentJson = function(userPath){
				// inner path to user's content json
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + userPath + '/content.json';
				// get content.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(contentJson) {
					$scope.$apply(function(){
						contentJson = JSON.parse(contentJson);
						var currentOptionalFilesSpec = ".*.(epub|jpg|jpeg|png|gif|avi|ogg|webm|mp4|mp3|mkv)";
						if (contentJson && !contentJson.optional || 
							contentJson && contentJson.optional !== currentOptionalFilesSpec){
							contentJson.optional = currentOptionalFilesSpec;
							var json_raw = unescape(encodeURIComponent(JSON.stringify(contentJson, void 0, '\t')));						
							Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
								console.log(res);
								// sign & publish site
								Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
									console.log(res);
									// apply to scope
									$scope.$apply(function() {
										Page.cmd("wrapperNotification", ["done", "User content.json patched!", 10000]);
										$scope.finishLoadingUser();
									});
								});
							});
						} else {
							$scope.finishLoadingUser();
						}
					});
				});
			};

			// finish loading user
			$scope.finishLoadingUser = function(){
				$scope.loading = false;
				$scope.getUserNotifications();
			};

			// get user notifications
			$scope.getUserNotifications = function(){
				// notifications query
				var query = Notification.generateUserNotificationsQuery($scope.page.site_info.cert_user_id);
				Page.cmd("dbQuery", query, function(notifications) {
					if (notifications.length > 0){
						$scope.user.notifications = Notification.renderUserNotifications(notifications);
						$scope.user.notifications_total = notifications.length;
					} else {
						$scope.user.notifications_total = 0;
					}
					$scope.$apply();
				});
			};

			// show user notifications
			$scope.showUserNotifications = function(){
				if ($scope.user.notifications_total > 0){
					if ($scope.show_notifications === true){
						$scope.show_notifications = false;
					} else {
						$scope.show_notifications = true;
					}
				}
			};

			// user notifications menu css
			$scope.toggleNotificationMenu = function(show_notifications){
				var cssClass = '';
				if (show_notifications === true){
					cssClass = 'open';
				}
				return cssClass;
			}

			// set notifications menu item css
			$scope.setNotificationMenuItemCss = function(notification){
				var cssClass = '';
				if (notification.notification_read_id){
					cssClass = 'read';
				}
				return cssClass;
			};
			// register user
			$scope.registerUser = function() {
				// inner path to user's json files
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
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
								$scope.renderUser(user);
								$scope.updateContentJson();
							});
						});
					});
				});
			};

			// read notification
			$scope.readNotification = function(){
		    	// notification id
				var notification_id = $location.$$absUrl.split('rn_id=')[1];
				if (notification_id.indexOf('&') > -1){ notification_id = notification_id.split('&')[0]; }
				var read_notification = Notification.onReadNotification($scope.user.notifications,notification_id);
				if (read_notification === true){
					// inner path to user's data.json file
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						// render data
						if (data){ 
							data = JSON.parse(data);
							if (!data.notification_read){
								data.notification_read = [];
								data.next_notification_read_id = 1;
							}
						} else { 
							data = { 
								next_notification_read_id:1, 
								notification_read:[] 
							}; 
						}
						// new notification read entry					
						var notification_read = {
							notification_read_id:$scope.page.site_info.auth_address + data.next_notification_read_id.toString(),
							notification_id:notification_id,
							added:+(new Date),
						}
						// add notification read to user's notifications read
						data.notification_read.push(notification_read);
						// update next notification read id #
						data.next_notification_read_id += 1;
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.updateContentJson();
								$scope.$apply();
							});
						});
					});
				}
			};

			// on read notification
			$rootScope.$on('readNotification',function(event,mass){
				$scope.readNotification();
			});

			// on new user selected
			$rootScope.$on('newUserSelected',function(event,mass){
				$scope.page = mass;
				if ($scope.page.site_info.cert_user_id){
					if ($scope.page.site_info.cert_user_id.split('@') === 'zeroid.bit' || $scope.page.site_info.cert_user_id.split('@') === 'zv.anonymous'){									
						$scope.getUserInfo();
					}
				}
			});
		};

		var template =	'<div id="user-menu-container" style="width: 200%;margin-left: -100%;">' +		
							'<div class="user-menu fg-color-secondary" ng-init="getUserInfo()" ng-if="page.site_info.cert_user_id">' +
						    	'<ul ng-if="!loading">' +
						    		'<li><a style="padding:0;" ng-click="createZvCert()" class="user-name">Selected User ID: {{page.site_info.cert_user_id.split(\'@\')[0]}} (change)</a></li>' +
						    		'<li><a uib-tooltip="My Channels ({{user.channels_total}})" href="/{{page.site_info.address}}/index.html?view:user-admin+section:my_channels"><i class="my-channels-icon" aria-hidden="true"></i></a></li>' +
						    		'<li><a uib-tooltip="My Topics ({{user.topics_total}})" href="/{{page.site_info.address}}/index.html?view:user-admin+section:topics"><i class="fa fa-server" aria-hidden="true"></i></li>' +
						    		'<li><a uib-tooltip="My Comments ({{user.comments_total}})" href="/{{page.site_info.address}}/index.html?view:user-admin+section:comments"><i class="fa fa-commenting" aria-hidden="true"></i></a></li>' +
						    	'</ul>' +
						    	'<span class="loader" ng-if="loading"></span>' +
					    	'</div>' +
					    	'<div class="user-menu" ng-if="!page.site_info.cert_user_id">' +
					    		'<span style="padding-right:5px;"><a ng-click="createZvCert()">login</a> to participate</span>' +
					    	'</div>' +
					    '</div>';

		return {
			restrict: 'AE',
			replace:true,
			controller: controller,
			template:template
		}

	}
]);