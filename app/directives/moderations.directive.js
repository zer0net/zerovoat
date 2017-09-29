app.directive('moderations', ['Moderation','Item',
	function(Moderation,Item) {

		// moderations controller
		var controller = function($scope,$element) {

			// get all moderators moderations
			$scope.getModerations = function(moderator){
				var query = ["SELECT * FROM moderation WHERE moderator_name='"+moderator.user_name+"' AND channel_id='"+$scope.channel.channel_id+"'"];
				Page.cmd("dbQuery",query,function(moderations){
					moderator.moderations = moderations;
					$scope.$apply();
				});
			};

			// get item moderations (visibility)
			$scope.getItemModerations = function(item){
				item = Item.determineItemTypeId(item);
				var query = ["SELECT * FROM moderation WHERE item_type='"+item.item_type+"' AND item_id='"+item[item.item_id]+"' AND moderation_type='visibility' AND current=1 ORDER BY added"];
				Page.cmd("dbQuery", query, function(moderations) {
					item = Moderation.renderItemModertaions(item,moderations,$scope.view)
					$scope.$apply();
				});
			};

			// toggle item visibility
			$scope.toggleItemVisibility = function(moderation,item){
				moderation.moderation_type = 'visibility';
				if (!item.moderation || item.moderation.visible === 1){
					// hide topic
					moderation.visible = 0;
				} else {
					// show topic
					moderation.visible = 1;			
				}
				// create moderation
				$scope.createModeration(moderation,item);
			};

			// create moderation
			$scope.createModeration = function(moderation,item){
				// inner path to user's json files
				var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json' 				
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
							if (!data.moderation){
								data.moderation = [];
								data.next_moderation_id = 1;
							}
						} else { 
							data = { 
								next_moderation_id:1, 
								moderation:[] 
							};
						}
						// moderation obj
						moderation.moderation_id = $scope.page.site_info.auth_address + "md" + data.next_moderation_id.toString();
						moderation.current = true;
						moderation.added = +(new Date);
						// get current moderation object & index
						var c_mod = Moderation.findCurrentItemModeration(data.moderation,moderation);
						if (c_mod){
							c_mod.moderation.current = false;
							data.moderation.splice(c_mod.index,1);
							data.moderation.push(c_mod.moderation);
						}
						// add moderation to user's moderations
						data.moderation.push(moderation);
						// update next moderation id #
						data.next_moderation_id += 1;
						// update content.json
						var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
						Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
							// update data.json
							var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
							Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
								// sign & publish site
								Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
									// apply to scope
									$scope.$apply(function() {
										Page.cmd("wrapperNotification", ["done", moderation.item_type +" Moderated!", 10000]);
										$scope.getItemModerations(item);
									});
								});
							});
						});
					});
				});
			};

			/* TOPICS */

				// toggle topic visibility
				$scope.toggleTopicVisibility = function(topic){
					var moderation = {
						channel_id:topic.channel_id,
						item_type:'topic',
						item_id:topic.topic_id,
						moderator_name:$scope.moderator.user_name,
						topic_id:topic.topic_id
					};
					$scope.toggleItemVisibility(moderation,topic);
				};

				// add sticky topic
				$scope.addStickyTopic = function(topic,channel){
					var moderation = {
						channel_id:$scope.channel.channel_id,
						item_type:'channel',
						item_id:$scope.channel.channel_id,
						moderator_name:$scope.moderator.user_name,
						moderation_type:'sticky',
						sticky_id:topic.topic_id				
					};
					// create moderation
					$scope.createModeration(moderation,channel);
				};

			/* /TOPICS */

			/* COMMENTS */

				// toggle comment visibility
				$scope.toggleCommentVisibility = function(comment){
					var moderation = {
						item_type:'comment',
						item_id:comment.comment_id,
						moderator_name:$scope.moderator.user_name,
						topic_id:comment.topic_id,
						comment_id:comment.comment_id				
					};
					$scope.toggleItemVisibility(moderation,comment);
				};

			/* /COMMENTS */
		};

		return {
			restrict: 'A',
			replace:false,
			controller: controller
		}

	}
]);