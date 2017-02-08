app.directive('moderations', ['Moderation',
	function(Moderation) {

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

			// get item moderations
			$scope.getItemModerations = function(item){
				var item_type,
					item_id;
				for (var i in item){
					if (i === 'topic_id'){
						item_type = 'topic';
						item_id='topic_id';
					} else if (i === 'comment_id'){
						item_type = 'comment';
						item_id = 'comment_id';
					} 
				}
				var query = ["SELECT * FROM moderation WHERE item_type='"+item_type+"' AND item_id='"+item[item_id]+"' AND current=1 ORDER BY added"];
				Page.cmd("dbQuery", query, function(moderations) {
					if (moderations.length > 0){
						item.moderations = moderations;
						$scope.renderItemModerations(item);
					} else {
						// default settings
						item.visible = 1;
						$scope.$apply();
					}
				});
			};

			// render item moderations 
			$scope.renderItemModerations = function(item){
				// get most recent moderation item index
				var most_recent_index = 0;
				var most_recent = 0;
				item.moderations.forEach(function(moderation,index){
					if (moderation.added > most_recent){
						most_recent = moderation.added;
						most_recent_index = index;
						if ($scope.view === 'moderate' || $scope.view === 'edit'){
							item.visible = 1;
						} else {
							item.visible = moderation.visible;
						}
					}
				});
				// assign to item moderation
				item.moderation = item.moderations[most_recent_index];
				$scope.$apply();
			};

			// toggle item visibility
			$scope.toggleItemVisibility = function(moderation,item){
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
				// inner path to user's data.json file
				var inner_path = 'data/users/' + $scope.page.site_info.auth_address + '/data.json';
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
					moderation.moderation_id = $scope.page.site_info.auth_address + data.next_moderation_id.toString();
					moderation.current = true;
					moderation.added = +(new Date);
					// get current moderation object & index
					var c_mod = Moderation.findCurrentItemModeration(data.moderation,moderation);
					if (c_mod){
						data.moderation.splice(c_mod.index,1);
						data.moderation.push(c_mod.moderation);
					}
					// add moderation to user's moderations
					data.moderation.push(moderation);
					// update next moderation id #
					data.next_moderation_id += 1;
					// write to file
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
			};

			/* TOPICS */

				// toggle topic visibility
				$scope.toggleTopicVisibility = function(topic){
					var moderation = {
						channel_id:$scope.channel.channel_id,
						item_type:'topic',
						item_id:topic.topic_id,
						moderator_name:$scope.moderator.user_name,
						topic_id:topic.topic_id
					}
					$scope.toggleItemVisibility(moderation,topic);
				};

			/* /TOPICS */

			/* COMMENTS */

				// toggle comment visibility
				$scope.toggleCommentVisibility = function(comment){
					var moderation = {
						channel_id:$scope.channel.channel_id,
						item_type:'comment',
						item_id:comment.comment_id,
						moderator_name:$scope.moderator.user_name,
						topic_id:$scope.topic.topic_id						
					}
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