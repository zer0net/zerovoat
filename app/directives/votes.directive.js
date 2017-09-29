app.directive('votes', ['Notification',
	function(Notification) {

		// votes controller
		var controller = function($scope,$element) {
			
			// render topic votes
			$scope.renderVotes = function(item){
				// define vote vars
				item.votes_up = 0;
				item.votes_down = 0;
				item.voted = false;
				// loop each vote
				item.votes.forEach(function(vote,index){
					// get number of votes up / down
					if (vote.vote === 1){ item.votes_up += 1; } 
					else { item.votes_down += 1; }
					// determine if user has voted
					if (vote.user_id === $scope.page.site_info.cert_user_id || 
						vote.user_id === $scope.page.site_info.auth_address) {
						item.voted = true;
						item.vote_user = vote;
					}
				});
				// calculate total sum of votes
				item.votes_sum = item.votes_up - item.votes_down;
				// generate vote-bar dimensions
				var vote_percentage = 100 / item.votes.length;
				item.uvp = item.votes_up * vote_percentage;
				item.dvp = item.votes_down * vote_percentage;
			};

			// user vote css
			$scope.userVoteCss = function(vote_user){
				cssClass = '';
				if (vote_user){
					if (vote_user.vote === 1){
						cssClass = 'up-voted'
					} else if (vote_user.vote === 0){
						cssClass = 'down-voted';
					}
				}
				return cssClass;
			}

			/** TOPIC **/

				// get topic votes
				$scope.getTopicVotes = function(topic){
					var query = ["SELECT * FROM topic_vote WHERE topic_id='"+topic.topic_id+"' ORDER BY added"];
					Page.cmd("dbQuery", query, function(votes) {
						$scope.$apply(function(){
							if (votes){
								topic.votes = votes;
								$scope.renderVotes(topic);
							}
						});
					});
				};

				// on topic up vote
				$scope.onUpVoteTopic = function(topic){
					if ($scope.page.site_info.cert_user_id){
						// if topic is voted by user
						if (topic.voted === true){
							if (topic.vote_user.vote === 1){
								// delete
								$scope.deleteTopicVote(topic);
							} else if (topic.vote_user.vote === 0) {
								// change vote
								$scope.changeTopicVote(topic);
							}
						} else {
							// up vote topic
							$scope.upVoteTopic(topic);
						}
					} else {
						$scope.selectUser();
					}
				};

				// on topic down vote
				$scope.onDownVoteTopic = function(topic){
					if ($scope.page.site_info.cert_user_id){
						// if topic is voted by user
						if (topic.voted === true){
							if (topic.vote_user.vote === 0){
								// delete
								$scope.deleteTopicVote(topic);
							} else if (topic.vote_user.vote === 1) {
								// change vote
								$scope.changeTopicVote(topic);
							}
						} else {
							// up vote topic
							$scope.downVoteTopic(topic);
						}
					} else {
						$scope.selectUser();
					}
				};

				// up vote topic
				$scope.upVoteTopic = function(topic){
					// inner path to user's json files
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						// render data
						if (data){ 
							data = JSON.parse(data);
							if (!data.topic_vote){
								data.topic_vote = [];
								data.next_topic_vote_id = 1;
							}
						} else { 
							data = { 
								next_topic_vote_id:1, 
								topic_vote:[] 
							}; 
						}
						// new topic vote entry
						var topic_vote = {
							topic_vote_id:$scope.page.site_info.address + "vt" + data.next_topic_vote_id.toString(),
							topic_id:topic.topic_id,
							vote:1,
							added:+(new Date)
						};
						// user id
						if ($scope.page.site_info.cert_user_id){ topic_vote.user_id = $scope.page.site_info.cert_user_id; } 
						else { topic_vote.user_id = $scope.page.site_info.auth_address; }				
						// add topic vote to user's topic votes array
						data.topic_vote.push(topic_vote);
						// update next topic vote id #
						data.next_topic_vote_id += 1;
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Topic Up Voted!", 10000]);
									$scope.getTopicVotes(topic);
									/*var notification = Notification.createTopicVoteNotification(topic_vote,topic);
									$scope.createNotification(notification);*/
								});
							});
						});	
					});
				};

				// down vote topic
				$scope.downVoteTopic = function(topic){
					// inner path to user's json files
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						// render data
						if (data){ 
							data = JSON.parse(data);
							if (!data.topic_vote){
								data.topic_vote = [];
								data.next_topic_vote_id = 1;
							}
						} else { 
							data = { 
								next_topic_vote_id:1, 
								topic_vote:[] 
							}; 
						}
						// new topic vote entry
						var topic_vote = {
							topic_vote_id:$scope.page.site_info.address + "vt" + data.next_topic_vote_id.toString(),
							topic_id:topic.topic_id,
							vote:0,
							added:+(new Date)
						};
						// user id
						if ($scope.page.site_info.cert_user_id){ topic_vote.user_id = $scope.page.site_info.cert_user_id; } 
						else { topic_vote.user_id = $scope.page.site_info.auth_address; }				
						// add topic vote to user's topic votes array
						data.topic_vote.push(topic_vote);
						// update next topic vote id #
						data.next_topic_vote_id += 1;
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Topic Down Voted!", 10000]);
									$scope.getTopicVotes(topic);
									/*var notification = Notification.createTopicVoteNotification(topic_vote,topic);
									$scope.createNotification(notification);*/
								});
							});
						});
					});
				};

				// change topic vote
				$scope.changeTopicVote = function(topic){
					// inner path to user's json files
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						data = JSON.parse(data);
						// get topic vote
						var topic_vote;
						var topicVoteIndex;
						data.topic_vote.forEach(function(t_vote,index){
							if (t_vote.topic_id === topic.topic_id){
								if (t_vote.user_id === $scope.page.site_info.cert_user_id || 
									t_vote.user_id === $scope.page.site_info.auth_address){
									// change topic vote's vote parameter
									if (t_vote.vote === 1){t_vote.vote = 0}
									else if (t_vote.vote === 0){t_vote.vote = 1}
									topicVoteIndex = index;
									topic_vote = t_vote;
								}
							}
						});	
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Topic Vote Changed!", 10000]);
									$scope.getTopicVotes(topic);
									/*var notification = Notification.createTopicVoteNotification(topic_vote,topic);
									$scope.createNotification(notification);*/		
								});
							});
						});
					});
				};

				// delete topic vote
				$scope.deleteTopicVote = function(topic){
					// inner path to user's json files
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						data = JSON.parse(data);
						// get topic vote's index	
						var topicVoteIndex;
						data.topic_vote.forEach(function(topic_vote,index){
							if (topic_vote.topic_id === topic.topic_id){
								if (topic_vote.user_id === $scope.page.site_info.cert_user_id || 
									topic_vote.user_id === $scope.page.site_info.auth_address){
									topicVoteIndex = index;
								}
							}
						});	
						// remove topic vote from user's topic votes array
						data.topic_vote.splice(topicVoteIndex,1);
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Topic Vote Deleted!", 10000]);
									$scope.getTopicVotes(topic);
								});
							});
						});
					});	
				};

			/** /TOPIC **/

			/** COMMENT **/

				$scope.getCommentVotes = function(comment) {
					var query = ["SELECT * FROM comment_vote WHERE comment_id='"+comment.comment_id+"' ORDER BY added"];
					Page.cmd("dbQuery", query, function(votes) {
						$scope.$apply(function(){
							comment.votes = votes;
							$scope.renderVotes(comment);
						});
					});
				};

				// on comment up vote
				$scope.onUpVoteComment = function(comment,topic){
					if ($scope.page.site_info.cert_user_id){
						// if comment is voted by user
						if (comment.voted === true){
							if (comment.vote_user.vote === 1){
								// delete
								$scope.deleteCommentVote(comment,topic);
							} else if (comment.vote_user.vote === 0) {
								// change vote
								$scope.changeCommentVote(comment,topic);
							}
						} else {
							// up vote comment
							$scope.upVoteComment(comment,topic);
						}
					} else {
						$scope.selectUser();
					}	
				};

				// on comment down vote
				$scope.onDownVoteComment = function(comment,topic){
					if ($scope.page.site_info.cert_user_id){
						// if comment is voted by user
						if (comment.voted === true){
							if (comment.vote_user.vote === 0){
								// delete
								$scope.deleteCommentVote(comment,topic);
							} else if (comment.vote_user.vote === 1) {
								// change vote
								$scope.changeCommentVote(comment,topic);
							}
						} else {
							// up vote comment
							$scope.downVoteComment(comment,topic);
						}
					} else {
						$scope.selectUser();
					}						
				};

				// up vote comment
				$scope.upVoteComment = function(comment,topic){
					// inner path to user's json files
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						// render data
						if (data){ 
							data = JSON.parse(data);
							if (!data.comment_vote){
								data.comment_vote = [];
								data.next_comment_vote_id = 1;
							}
						} else { 
							data = { 
								next_comment_vote_id:1, 
								comment_vote:[] 
							}; 
						}
						// new comment vote entry
						var comment_vote = {
							comment_vote_id:$scope.page.site_info.auth_address + "cvt" + data.next_comment_vote_id.toString(),
							comment_id:comment.comment_id,
							vote:1,
							added:+(new Date)
						};
						// user id
						if ($scope.page.site_info.cert_user_id){ comment_vote.user_id = $scope.page.site_info.cert_user_id; } 
						else { comment_vote.user_id = $scope.page.site_info.auth_address; }				
						// add comment vote to user's comment votes array
						data.comment_vote.push(comment_vote);
						// update next comment vote id #
						data.next_comment_vote_id += 1;
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Comment Up Voted!", 10000]);
									$scope.getCommentVotes(comment);
									/*var notification = Notification.createCommentVoteNotification(comment_vote,comment,topic);
									$scope.createNotification(notification);*/
								});
							});
						});
					});
				};

				// down vote comment
				$scope.downVoteComment = function(comment,topic){
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						// render data
						if (data){ 
							data = JSON.parse(data);
							if (!data.comment_vote){
								data.comment_vote = [];
								data.next_comment_vote_id = 1;
							}
						} else { 
							data = { 
								next_comment_vote_id:1, 
								comment_vote:[] 
							}; 
						}
						// new comment vote entry
						var comment_vote = {
							comment_vote_id:$scope.page.site_info.auth_address + "cvt" + data.next_comment_vote_id.toString(),
							comment_id:comment.comment_id,
							vote:0,
							added:+(new Date)
						};
						// user id
						if ($scope.page.site_info.cert_user_id){ comment_vote.user_id = $scope.page.site_info.cert_user_id; } 
						else { comment_vote.user_id = $scope.page.site_info.auth_address; }				
						// add comment vote to user's comment votes array
						data.comment_vote.push(comment_vote);
						// update next comment vote id #
						data.next_comment_vote_id += 1;
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Comment Down Voted!", 10000]);
									$scope.getCommentVotes(comment);
									/*var notification = Notification.createCommentVoteNotification(comment_vote,comment,topic);
									$scope.createNotification(notification);*/
								});
							});
						});
					});
				};

				// change comment vote
				$scope.changeCommentVote = function(comment,topic){
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						data = JSON.parse(data);
						// get comment vote
						var comment_vote;
						var commentVoteIndex;
						data.comment_vote.forEach(function(t_vote,index){
							if (t_vote.comment_id === comment.comment_id){
								if (t_vote.user_id === $scope.page.site_info.cert_user_id || 
									t_vote.user_id === $scope.page.site_info.auth_address){
									// change comment vote's vote parameter
									if (t_vote.vote === 1){t_vote.vote = 0}
									else if (t_vote.vote === 0){t_vote.vote = 1}
									commentVoteIndex = index;
									comment_vote = t_vote;
								}
							}
						});	
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Comment Vote Changed!", 10000]);
									$scope.getCommentVotes(comment);
									/*var notification = Notification.createCommentVoteNotification(comment_vote,comment,topic);
									$scope.createNotification(notification);*/							
								});
							});
						});
					});
				};

				// delete comment vote
				$scope.deleteCommentVote = function(comment){
					// inner path to user's json files
					var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
						// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						data = JSON.parse(data);
						// get comment vote's index	
						var commentVoteIndex;
						data.comment_vote.forEach(function(comment_vote,index){
							if (comment_vote.comment_id === comment.comment_id){
								if (comment_vote.user_id === $scope.page.site_info.cert_user_id || 
									comment_vote.user_id === $scope.page.site_info.auth_address){
									commentVoteIndex = index;
								}
							}
						});	
						// remove comment vote from user's comment votes array
						data.comment_vote.splice(commentVoteIndex,1);
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "Comment Vote Deleted!", 10000]);
									$scope.getCommentVotes(comment);
								});
							});
						});
					});
				};

			/** /COMMENT **/

		};

		return {
			restrict: 'AE',
			replace:false,
			controller: controller
		}

	}
]);