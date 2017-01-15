app.directive('comments', [
	function() {

		// comments controller
		var controller = function($scope,$element) {
			
			// get topic comments
			$scope.getTopicComments = function(topic) {
				var query = ["SELECT * FROM comment WHERE topic_id='"+$scope.topic.topic_id+"' AND comment_parent_id='0' ORDER BY added"];
				Page.cmd("dbQuery", query, function(comments) {
					$scope.$apply(function(){
						topic.comments = comments;
					});
				});				
			};

			// get topic comments
			$scope.countTopicComments = function(topic) {
				var query = ["SELECT count(*) FROM comment WHERE topic_id='"+$scope.topic.topic_id+"'"];
				Page.cmd("dbQuery", query, function(comments) {
					$scope.$apply(function(){
						topic.comments_total = comments[0]['count(*)'];
					});
				});				
			};

			// get comment replys
			$scope.getCommentReplys = function(comment) {
				var query = ["SELECT * FROM comment WHERE topic_id='"+$scope.topic.topic_id+"' AND comment_parent_id='"+comment.comment_id+"' ORDER BY added"];
				Page.cmd("dbQuery", query, function(comments) {
					$scope.$apply(function(){
						comment.replys = comments;
						comment.replys_total = comments.length;
					});
				});				
			};

			// init sort menu
			$scope.initSortMenu = function(comment) {
				// sort options
				var sort = {
					options:[{
						name:'new',
						val:'-added'
					},{
						name:'old',
						val:'added'
					},{
						name:'top',
						val:'-votes_sum'
					},{
						name:'bottom',
						val:'votes_sum'
					},{
						name:'intensity',
						val:'-replys_total'
					}]
				};
				// set current sort option
				sort.current = sort.options[0];
				// determine if per comment or scope
				if (comment){
					comment.sort = sort;
				} else {
					$scope.sort = sort;
				}
			};

			// sort by
			$scope.sortBy = function(option,comment) {
				// determine if per comment or scope
				if (comment){
					comment.sort.current = option;
				} else {
					$scope.sort.current = option;
				}
			};

			// show reply form
			$scope.toggleReplyForm = function(comment) {
				if (comment.show_reply === true){
					comment.show_reply = false;
				} else if (comment.show_reply === false || !comment.show_reply){
					comment.show_reply = true;
				}
			};

			// post comment
			$scope.postComment = function(comment) {
				var comment_body = comment.body;
				comment.body = '';
				// inner path to user's data.json file
				var inner_path = 'data/users/' + $scope.page.site_info.auth_address + '/data.json';
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
						comment_id:$scope.page.site_info.auth_address + data.next_comment_id.toString(),
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
					// write to file
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							// apply to scope
							$scope.$apply(function() {
								Page.cmd("wrapperNotification", ["done", "Comment Posted!", 10000]);
								if (!$scope.topic.comments) $scope.topic.comments = [];
								$scope.topic.comments.push(comment);
							});
						});
					});
				});
			};

			// post reply
			$scope.postReply = function(reply,comment) {
				comment.show_reply = false;
				// inner path to user's data.json file
				var inner_path = 'data/users/' + $scope.page.site_info.auth_address + '/data.json';
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
						comment_id:$scope.page.site_info.auth_address + data.next_comment_id.toString(),
						comment_parent_id:comment.comment_id,
						topic_id:$scope.topic.topic_id,
						body:reply.body,
						added:+(new Date)
					};
					// user id
					if ($scope.page.site_info.cert_user_id){ reply.user_id = $scope.page.site_info.cert_user_id; } 
					else { reply.user_id = $scope.page.site_info.auth_address; }				
					// add comment to user's comments
					data.comment.push(reply);
					// update next comment id #
					data.next_comment_id += 1;
					// write to file
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							// apply to scope
							$scope.$apply(function() {
								Page.cmd("wrapperNotification", ["done", "Reply Posted!", 10000]);
								if (!comment.replys) comment.replys = [];
								comment.replys.push(reply);
							});
						});
					});
				});
			};

		};

		return {
			restrict: 'A',
			replace:false,
			controller: controller
		}

	}
]);