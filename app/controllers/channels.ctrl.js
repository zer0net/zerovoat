app.controller('ChannelsCtrl', ['$scope','$location','$window','$rootScope',
	function($scope,$location,$window,$rootScope) {

		// get channel
		$scope.getChannel = function(topic) {
			$scope.channel_loading = true;
			var channel_id;
			if (topic){
				channel_id = topic.channel_id;
			} else {
				channel_id = $location.$$absUrl.split('channel_id=')[1].split('&')[0];
			}
			var query = ["SELECT * FROM channel WHERE name IS NOT NULL AND channel_id='"+channel_id+"'"];
			Page.cmd("dbQuery", query, function(channel) {
				$scope.$apply(function(){
					if (channel.length > 0){
						$scope.channel = channel[0];
						$rootScope.$broadcast('setChannel',$scope.channel);
						$scope.getChannelLayout();
						$scope.getChannelStickyTopic();
					}
				});
			});
		};

		// get channel layout 
		$scope.getChannelLayout = function(){
			var query = ["SELECT * FROM channel_layout WHERE channel_id='"+$scope.channel.channel_id+"'"];
			Page.cmd("dbQuery", query, function(channel_layout) {
				$scope.$apply(function(){
					if (channel_layout[0]){
						$scope.channel.layout = channel_layout[0];
						$scope.getChannelLayoutFiles();
					} else {
						$scope.channel_loading = false;
						$scope.channel_ready = true;
					}
				});
			});			
		};

		// get channel layout files
		$scope.getChannelLayoutFiles = function(){
			var query = ["SELECT * FROM file WHERE item_type='layout' AND item_id='"+$scope.channel.layout.channel_layout_id+"'"];
			Page.cmd("dbQuery", query, function(layout_files) {
				if (layout_files){
					layout_files.forEach(function(l_file,index){
						var attr_name = l_file.model_name;
						$scope.channel.layout[attr_name] = '/' + $scope.page.site_info.address + '/data/users/' + l_file.user_id + '/' + l_file.file_name;
					});
				}
				$scope.$apply(function(){
					$scope.channel_loading = false;
					$scope.channel_ready = true;
				});
			});
		};

		// get channel sticky topic
		$scope.getChannelStickyTopic = function(){
			var query = ["SELECT * FROM moderation WHERE item_type='channel' AND channel_id='"+$scope.channel.channel_id+"' AND moderation_type='sticky' AND current=1 "];
			Page.cmd("dbQuery", query, function(stickyTopicModeration) {
				if (stickyTopicModeration[0]){
					$scope.channel.sticky_id = stickyTopicModeration[0].sticky_id;
					var query = ["SELECT * FROM topic WHERE topic_id='"+$scope.channel.sticky_id+"'"];
					Page.cmd("dbQuery", query, function(stickyTopic) {
						if (stickyTopic[0]){
							$scope.sticky_topic = stickyTopic[0];
							$scope.$apply();							
						}
					});
				}
			});			
		};

		// get sector
		$scope.getSector = function() {
			$scope.loading = false;
			var sector_id = $location.$$absUrl.split('sector_id=')[1].split('&')[0];
			var query = ["SELECT * FROM sector WHERE sector_id='"+sector_id+"'"];
			Page.cmd("dbQuery", query, function(sector) {
				$scope.sector = sector[0];
				$rootScope.$broadcast('setSector',$scope.sector);
				$scope.loading = false;
				$scope.$apply();
			});				
		};

		// create channel
		$scope.createChannel = function(channel){
			// inner path to user's json files
			var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get content.json
			Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (!content_json.optional) content_json.optional = "((?!json).)*$";
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.channel){
							data.channel = [];
							data.next_channel_id = 1;
						}
					} else { 
						data = { 
							next_channel_id:1, 
							channel:[] 
						}; 
					}
					// new category entry
					channel.channel_id = $scope.page.site_info.auth_address + "ch" + data.next_channel_id.toString();
					channel.added = +(new Date);
					// user id
					if ($scope.page.site_info.cert_user_id){ channel.user_id = $scope.page.site_info.cert_user_id; } 
					else { channel.user_id = $scope.page.site_info.auth_address; }				
					// add category to user's categorys
					data.channel.push(channel);
					// update next category id #
					data.next_channel_id += 1;
					// update content.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
					Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Channel Created!", 10000]);
									$window.location.href = '/'+ $scope.page.site_info.address +'/index.html?view:channel+channel_id='+channel.channel_id;
								});
							});
						});
					});
				});
			});
		};

		// update channel
		$scope.updateChannel = function(channel){
			// inner path to user's json files
			var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get content.json
			Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (!content_json.optional) content_json.optional = "((?!json).)*$";
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					data = JSON.parse(data);
					// get channel's index
					var chanIndex;
					data.channel.forEach(function(ch,index){
						if (ch.channel_id === channel.channel_id){
							chanIndex = index;
						}
					});	
					// remove & re-add channel to user's channels
					data.channel.splice(chanIndex,1);
					data.channel.push(channel);
					// update content.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
					Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Channel Updated!", 10000]);
									$window.location.href = '/'+ $scope.page.site_info.address +'/index.html?view:channel+channel_id='+channel.channel_id;
								});
							});
						});
					});
				});
			});
		};

		// add channel moderator 
		$scope.addChannelModerator = function(moderator){
			// inner path to user's json files
			var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get content.json
			Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (!content_json.optional) content_json.optional = "((?!json).)*$";
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// is channel mod
					var isChannelMod = false;
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.moderator){
							data.moderator = [];
							data.next_moderator_id = 1;
						} else {
							data.moderator.forEach(function(mod,index){
								if (mod.user_name === moderator){
									isChannelMod = true;
									Page.cmd("wrapperNotification", ["info", "User is already a moderator for this channel!", 10000]);								
								}
							});
						}
					} else { 
						data = { 
							next_moderator_id:1, 
							moderator:[] 
						}; 
					}
					// if user is not already a channel moderator
					if (isChannelMod === false){
						// moderator obj
						moderator = {
							moderator_id:$scope.page.site_info.auth_address + "mod" + data.next_moderator_id.toString(),
							user_name:moderator,
							channel_id:$scope.channel.channel_id,
							added:+(new Date)
						};
						// add moderator to user's moderators
						data.moderator.push(moderator);
						// update next moderator id #
						data.next_moderator_id += 1;
						// update content.json
						var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
						Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
							// write to file
							var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
							Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
								console.log(res);
								// sign & publish site
								Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
									console.log(res);
									// apply to scope
									Page.cmd("wrapperNotification", ["done", "Moderator Added!", 10000]);
									$scope.$apply();
								});
							});
						});
					}
				});
			});
		};

		// create channel layout
		$scope.createChannelLayout = function(channel,layout){
			// inner path to user's json files
			var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get content.json
			Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (!content_json.optional) content_json.optional = "((?!json).)*$";
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.channel_layout){
							data.channel_layout = [];
							data.next_channel_layout_id = 1;
						}
					} else { 
						data = { 
							next_channel_layout_id:1, 
							channel_layout:[] 
						}; 
					}
					// new channel layout entry
					var channel_layout = layout;
					channel_layout.channel_id = channel.channel_id;
					channel_layout.channel_layout_id = $scope.page.site_info.auth_address + "chla" + data.next_channel_id.toString();
					channel_layout.added = +(new Date);
					// user id
					if ($scope.page.site_info.cert_user_id){ channel_layout.user_id = $scope.page.site_info.cert_user_id; } 
					else { channel_layout.user_id = $scope.page.site_info.auth_address; }				
					// add channel layout to user's channel layouts
					data.channel_layout.push(channel_layout);
					// update next channel layout id #
					data.next_channel_layout_id += 1;
					// update content.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
					Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Channel Layout Created!", 10000]);
									$window.location.href = '/'+ $scope.page.site_info.address +'/index.html?view:channel+channel_id='+channel.channel_id;
								});
							});
						});
					});
				});
			});
		};

		// update channel layout
		$scope.updateChannelLayout = function(layout){
			// inner path to user's json files
			var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get content.json
			Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (!content_json.optional) content_json.optional = "((?!json).)*$";
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					data = JSON.parse(data);
					// get channel's index
					var chanLayoutIndex;
					data.channel_layout.forEach(function(ch_layout,index){
						if (ch_layout.channel_layout_id === layout.channel_layout_id){
							chanLayoutIndex = index;
						}
					});	
					// remove & re-add channel to user's channels
					data.channel_layout.splice(chanLayoutIndex,1);
					data.channel_layout.push(layout);
					// update content.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
					Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Channel Layout Updated!", 10000]);
									$window.location.href = '/'+ $scope.page.site_info.address +'/index.html?view:channel+channel_id='+layout.channel_id;
								});
							});
						});
					});
				});
			});
		};

		// create sector
		$scope.createSector = function(sector){
			// inner path to user's json files
			var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get content.json
			Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (!content_json.optional) content_json.optional = "((?!json).)*$";
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.sector){
							data.sector = [];
							data.next_sector_id = 1;
						}
					} else { 
						data = { 
							next_sector_id:1, 
							sector:[] 
						}; 
					}
					// new sector entry
					sector.sector_id = $scope.page.site_info.auth_address + "sec" + data.next_channel_id.toString();
					sector.added = +(new Date);
					// user id
					if ($scope.page.site_info.cert_user_id){ sector.user_id = $scope.page.site_info.cert_user_id; } 
					else { sector.user_id = $scope.page.site_info.auth_address; }				
					// add sector to user's sectors
					data.sector.push(sector);
					// update next sector id #
					data.next_sector_id += 1;
					// update content.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
					Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "sector Created!", 10000]);
									$window.location.href = '/'+ $scope.page.site_info.address +'/index.html?view:sector+sector_id='+sector.sector_id;
								});
							});
						});
					});
				});
			});
		};

	}
]);