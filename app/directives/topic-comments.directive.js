app.directive('topicComments', [
	function() {

		// topic comments controller
		var controller = function($scope,$element) {

			// init topic comments
			$scope.initTopicComments = function(){
				$scope.comments_loading = true;
				if ($scope.view === 'topic' || $scope.section === 'topic'){
					$scope.getTopicComments($scope.topic)
				} else if ($scope.view === 'user-admin' && $scope.section === 'comments'){
					$scope.getUserComments();
				}
			};

			// init topic comments
			$scope.initTopicCommentForm = function(){
				$scope.item_type = 'comment';
				$scope.comment = {body:''};
			};

			// init topic comments
			$scope.initCommentReplyForm = function(comment){
				$scope.item_type = 'comment';
				comment.reply = {
					body:''	
				};
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

			// onTopicReplys
			$scope.onTopicReplys = function(comment){
				if ($scope.view !== 'user-admin'){
					$scope.getCommentReplys(comment)
				}
			};

			// get comment item style
			$scope.getCommentItemStyle = function(comment,comment_id){
				var cssClass = '';
				if (comment_id && comment_id === comment.comment_id){
					cssClass = 'highlighted';
				}
				return cssClass;
			};

			// get comment media item 
			$scope.getCommentMediaItemStyle = function(comment){
				var cssClass = '';
				if (comment.file_id){
					cssClass = 'w-media';
				}
				return cssClass;
			};

			// edit comment
			$scope.editComment = function(comment){
				if (!comment.edit){
					comment.edit = true
				} else {
					comment.edit = false;
				}
			};

		};

		var template =  '<div class="topic-comments col-xs-12" comments ng-init="initTopicComments()">' +
						    '<!-- comment form -->' +
						    '<div id="comment-form" files ng-if="view === \'topic\' && page.site_info.cert_user_id" ng-init="initTopicCommentForm()">' +
						    	'<textarea ng-hide="comment.loading" placeholder="write your comment or upload file..." ng-model="comment.body"></textarea>' +
								'<img ng-hide="comment.loading" style="width:100%;" ng-src="{{comment.file.data_uri}}" ng-if="comment.image"/>' +
								'<div ng-hide="comment.loading" style="width:100%;margin:5px 0" ng-if="comment.video"><video-player ng-init="initVideoPlayer(comment.player)"></video-player></div>' +
						    	'<div ng-hide="comment.loading" class="form-btns">' +
							    	'<button class="btn primary-btn pull-right" ng-click="onCreateItem(comment)">submit comment</button>' +
									'<button class="btn primary-btn pull-right" ng-model="comment.file" ng-init="initFileUpload(comment)" dropzone="fileUploadConfig">{{comment_file_add_text}}</button>' +
						    	'</div>' +
						    	'<span ng-show="comment.loading" class="loader"></span>' +
						    '</div>' +
						    /*'<span ng-if="!page.site_file.cert_user_id"><a ng-click="selectUser()">login</a> to participate</span>' +*/
						    '<!-- /comment form -->' +
						    '<!-- comment list -->' +
						    '<div id="comment-list" ng-hide="comment_loading" ng-if="comments.length > 0">' +
						      '<hr ng-if="view === \'topic\'"/>' +
						      '<!-- comments sort -->' +
						      '<div class="comments-sort-menu row" ng-init="initSortMenu()">' +
						        '<div class="sort-options col-xs-12">' +
						          '<span>sort by: </span>' +
						          '<a ng-if="option.name !== sort.current.name" ng-repeat="option in sort.options" ng-bind="option.name" ng-click="sortBy(option)"></a>' +
						        '</div>' +
						        '<div class="selected-option col-xs-12">' +
						          '<span class="sort-label">sort: {{sort.current.name}}</span>' +
						        '</div>' +
						      '</div>' +
						      '<!-- /comments sort -->' +
						      '<!-- comment item -->' +
						      '<div ng-include="\'reply.html\'" ng-repeat="comment in comments | orderBy:sort.current.val" class="comment-container-wrap"></div>' +
						      '<!-- /comment item -->' +
						      '<!-- comment template -->' +
						      '<script type="text/ng-template" id="reply.html">' +
						        '<!-- reply item -->' +
						        '<div class="comment-wrapper" files ng-init="getItemFile(comment)" id="comment-{{comment.comment_id}}">' +
						        	'<div ng-init="onTopicReplys(comment)">' +
						          	'<div class="comment col-xs-12" moderations ng-init="getItemModerations(comment)"  ng-class="getCommentItemStyle(comment,comment_id)" ng-show="comment.visible === 1">' +
						              '<!-- comment left -->' +
						              '<div class="comment-left votes" ng-class="userVoteCss(comment.vote_user)" votes ng-init="getCommentVotes(comment)">' +
						                '<a ng-click="onUpVoteComment(comment,topic)" class="vote-arrow small arrow-up"></a>' +
						                '<a ng-click="onDownVoteComment(comment,topic)" class="vote-arrow small arrow-down"></a>' +
						              '</div>' +
						              '<!-- /comment left -->' +
						              '<!-- comment content -->' +
						              '<div class="comment-content">' +
						                '<!-- comment top -->' +
						                '<div class="comment-top col-xs-12">' +
						                	'<div class="comment-top-info">' +
							                  '<a ng-click="toggleCommentReplys()">[-]</a>' +
							                  '<span class="blue user-name">{{comment.user_id.split(\'@\')[0]}}</span>' +
							                  '<span>' +
							                    ' <span><b>{{comment.votes_sum}}</b> points</span>' +
							                    ' (<span class="votes-up">+{{comment.votes_up}}</span>|<span class="votes-down">-{{comment.votes_down}}</span>)' +
							                    ' <span am-time-ago="comment.added"></span>' +
							                  '</span>' +
							                  '<span ng-if="view === \'user-admin\' && section === \'comments\'">' +
							                  	' on <a href="/{{page.site_info.address}}/index.html?view:topic+topic_id={{comment.topic_id}}">{{comment.topic_title}}</a>' +
							                  	'<span ng-if="comment.comment_parent_id"> in reply to <a href="/{{page.site_info.address}}/index.html?view:topic+topic_id={{comment.topic_id}}+comment={{comment.comment_parent_id}}">comment</a></span>' +
							                  '</span>' +
						                  	'</div>' +
						                  	'<item-edit-toolbar ng-init="setItem(comment)"></item-edit-toolbar>' +
						                '</div>' +
						                '<!-- /comment top -->' +
						                '<!-- comment body -->' +
						                '<div class="comment-body col-xs-12" ng-hide="comment.edit">' +
						                	'<p ng-bind="comment.body"></p>' +
						                	'<div ng-if="comment.file" class="comment-media-item" ng-class="getCommentMediaItemStyle(comment)">' +
						                		'<img ng-src="{{comment.image_path}}" ng-if="comment.image" fallback-src="assets/img/404-not-found.png"/>' +
									    		'<div ng-if="comment.video"><video-player ng-init="initVideoPlayer(comment.player)"></video-player></div>' +
									    		'<span class="comment-file-peer-count">Peers: <span ng-if="comment.file.site_file.peer > 0">{{comment.file.site_file.peer}}</span><span ng-if="!comment.file.site_file.peer">0</span></span>' +
									    	'</div>' +
						                '</div>' +
						                '<div class="comment-body col-xs-12" ng-show="comment.edit">' +
									    	'<textarea ng-hide="comment.loading" placeholder="write your comment or upload file..." ng-model="comment.body"></textarea>' +
											'<img ng-if="comment.image && comment.file.data_uri" style="width:100%;" ng-src="{{comment.file.data_uri}}" ng-if="comment.image"/>' +
											'<div ng-if="comment.video && comment.file.data_uri"><video-player ng-init="initVideoPlayer(comment.player)"></video-player></div>' +
									    	'<div ng-hide="comment.loading" class="form-btns">' +
										    	'<button class="btn primary-btn pull-right" ng-click="updateComment(comment)">update comment</button>' +
												'<button class="btn primary-btn pull-right" ng-model="comment.file" ng-init="initFileUpload(comment)" dropzone="fileUploadConfig">{{comment_file_add_text}}</button>' +
									    	'</div>' +
									    	'<span ng-show="comment.loading" class="loader"></span>' +
						                '</div>' +
						                '<!-- /comment body -->' +
						                '<!-- comment options -->' +
						                '<div class="comment-options col-xs-12">' +
						                  '<a ng-if="page.site_info.cert_user_id" ng-click="toggleReplyForm(comment)">reply</a>' +
						                  /*'<a ng-if="!page.site_file.cert_user_id" ng-click="selectUser()">login to reply</a>' +*/
						                '</div>' +
						                '<!-- /comment options -->' +
						                '<!-- reply form -->' +
						                '<div class="comment-reply-form col-xs-12" ng-show="comment.show_reply" ng-init="initCommentReplyForm(comment)">' +
							                '<form files ng-init="initFileUpload(comment.reply)">' +
							                    '<textarea ng-hide="comment.reply.loading" ng-model="comment.reply.body"></textarea>' +
												'<img ng-hide="comment.reply.loading" style="width:100%;" ng-if="comment.reply.image" ng-src="{{comment.reply.file.data_uri}}" fallback-src="assets/img/404-not-found.png"/>' +
												'<div ng-hide="comment.reply.loading" style="width:100%;margin:5px 0" ng-if="comment.reply.video"><video-player ng-init="initVideoPlayer(comment.reply.player)"></video-player></div>' +
							                    '<div class="form-btns" ng-hide="comment.reply.loading">' +
								                    '<button class="btn primary-btn pull-right" ng-click="onCreateItem(comment.reply,comment)">reply</button>' +
													'<button class="btn primary-btn pull-right" ng-model="comment.reply.file" dropzone="fileUploadConfig">{{comment_file_add_text}}</button>' +
												'</div>' +			                    
							                    '<span ng-show="comment.reply.loading" class="loader"></span>' +
							                '</form>' +
						                '</div>' +
						                '<!-- /reply form -->' +
						                '<!-- reply list -->' +
						                '<div class="comment-reply-list col-xs-12" ng-if="comment.replys">' +
						                  '<!-- reply item -->' +
						                  '<div ng-include="\'reply.html\'" ng-repeat="comment in comment.replys | orderBy:\'-added\'"></div>' +
						                  '<!-- /reply item -->' +
						                '</div>' +
						                '<!-- /reply list -->' +
						              '</div>' +
						              '<!-- /comment content -->' +
						          	'</div>' +
						          	'</div>' +
						        '</div>' +
						        '<!-- /reply item -->' +
						      '</script>' +
						      '<!-- /comment template -->' +
						    '</div>' +
							'<span class="loader" ng-show="comments_loading"></span>' +
						    '<!-- /comment list -->' +
						'</div>';
		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);