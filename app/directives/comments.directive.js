app.directive('comments', ['Notification','Comment','$rootScope',
	function(Notification,Comment,$rootScope) {

		// comments controller
		var controller = function($scope,$element) {
			
			// get topic comments
			$scope.getTopicComments = function(topic) {
				var query = Comment.generateTopicCommentsQuery(topic.topic_id);
				Page.cmd("dbQuery", query, function(comments) {
					$scope.$apply(function(){
						$scope.comments = Comment.renderComments(comments,$scope.page.site_info.address,$scope.section,$scope.site_files,$scope.config,$scope.sites);
						$scope.countComments();
						$scope.comments_loading = false;
					});
				});
			};

			// get user comments
			$scope.getUserComments = function(user){
				var query = Comment.generateUserCommentsQuery($scope.page.site_info.cert_user_id);
				Page.cmd("dbQuery", query, function(comments) {
					$scope.$apply(function(){
						$scope.comments = Comment.renderComments(comments,$scope.page.site_info.address,$scope.section,$scope.site_files,$scope.config,$scope.sites);
						$scope.comments_loading = false;
						console.log($scope.comments);		
					});
				});			
			};

			// count comments
			$scope.countComments = function(){
				
			};

			// get comment replys
			$scope.getCommentReplys = function(comment) {
				var query = Comment.genereateCommentReplysQuery(comment.comment_id);
				Page.cmd("dbQuery", query, function(comments) {
					console.log(comments);
					$scope.$apply(function(){
						comment.replys = Comment.renderComments(comments,$scope.page.site_info.address,$scope.section,$scope.site_files,$scope.config,$scope.sites);
						comment.replys_total = comments.length;
					});
				});				
			};

			// post comment
			$scope.postComment = function(s_comment) {
				var comment_body = s_comment.body;
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.comment){
							data.comment = [];
							data.next_comment_id = 1;
						}
					} else { 
						data = { 
							next_comment_id:1, 
							comment:[] 
						}; 
					}
					// new comment entry
					comment = {
						comment_id:$scope.page.site_info.auth_address + "comment" + data.next_comment_id.toString(),
						comment_parent_id:0,
						topic_id:$scope.topic.topic_id,
						body:comment_body,
						added:+(new Date)
					};
					// user id
					if ($scope.page.site_info.cert_user_id){ comment.user_id = $scope.page.site_info.cert_user_id; } 
					else { comment.user_id = $scope.page.site_info.auth_address; }				
					// add comment to user's comments
					data.comment.push(comment);
					// update next comment id #
					data.next_comment_id += 1;
					// update data.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							// apply to scope
							$scope.$apply(function() {
								Page.cmd("wrapperNotification", ["done", "Comment Posted!", 10000]);
								if (!$scope.topic.comments) $scope.topic.comments = [];
								if ($scope.topic) $scope.topic.comments_total += 1;								
								s_comment.loading = false;
								s_comment.image = false;
								s_comment.video = false;
								s_comment.body = '';
								$scope.comments.push(comment);
								//var notification = Notification.createCommentOnTopicNotification(comment,$scope.topic);
								//$scope.createNotification(notification);
								//$scope.updateContentJson();
							});
						});
					});
				});
			};

			// on post comment rootscope
			$rootScope.$on('postComment',function(event,mass){
				$scope.postComment(mass);
			});

			// post reply
			$scope.postReply = function(s_reply,comment,file) {
				var reply_body = s_reply.body;
				s_reply.loading = true;
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.comment){
							data.comment = [];
							data.next_comment_id = 1;
						}
					} else { 
						data = { 
							next_comment_id:1, 
							comment:[] 
						}; 
					}
					// new reply comment entry
					reply = {
						comment_id:$scope.page.site_info.auth_address + "comment" + data.next_comment_id.toString(),
						comment_parent_id:comment.comment_id,
						topic_id:$scope.topic.topic_id,
						body:reply_body,
						added:+(new Date)
					};
					// user id
					if ($scope.page.site_info.cert_user_id){ reply.user_id = $scope.page.site_info.cert_user_id; } 
					else { reply.user_id = $scope.page.site_info.auth_address; }				
					// add comment to user's comments
					data.comment.push(reply);
					// update next comment id #
					data.next_comment_id += 1;
					// update data.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							// apply to scope
							$scope.$apply(function() {
								Page.cmd("wrapperNotification", ["done", "Reply Posted!", 10000]);
								if (!comment.replys) comment.replys = [];
								if ($scope.topic) $scope.topic.comments_total += 1;
								comment.show_reply = false;								
								s_reply.loading = false;
								s_reply.image = false;
								s_reply.video = false;
								s_reply.body = '';

								comment.replys.push(reply);
								// var notification = Notification.createReplyOnCommentNotification(reply,comment,$scope.topic);
								// $scope.createNotification(notification);
								// $scope.updateContentJson();
							});
						});
					});
				});
			};

			// on post comment rootscope
			$rootScope.$on('postReply',function(event,mass){
				$scope.postReply(mass.item,mass.parent,mass.file);
			});

			// update comment
			$scope.updateComment = function(s_comment){
				s_comment.loading = true;
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					data = JSON.parse(data);
					// find item index in data.comments
					var commentIndex;
					data.comment.forEach(function(comment,index){
						if (comment.comment_id === s_comment.comment_id){
							comment.body = s_comment.body;
						}
					});
					// update data.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							// apply to scope
							$scope.$apply(function() {
								Page.cmd("wrapperNotification", ["done", "Comment Updated!", 10000]);
								s_comment.loading = false;
								s_comment.edit = false;
								//var notification = Notification.createCommentOnTopicNotification(comment,$scope.topic);
								//$scope.createNotification(notification);
								//$scope.updateContentJson();
							});
						});
					});
				});
			};

			// on update comment rootscope
			$rootScope.$on('updateComment',function(event,mass){
				$scope.updateComment(mass);
			});


		};

		return {
			restrict: 'A',
			replace:false,
			controller: controller
		}

	}
]);