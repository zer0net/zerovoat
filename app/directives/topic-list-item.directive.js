app.directive('topicListItem', ['$rootScope','$location',
	function($rootScope,$location) {

		// topic list item controller
		var controller = function($scope,$element) {

			// set topic
			$scope.setTopic = function(item){
				$scope.topic = item;
			};

			// on img load
			$scope.onImgLoad = function(topic){
				topic.img_loaded = 'loaded';
			};

			$scope.imgError = function(img,topic){
				topic.img_error = true;
			};

			// toggle topic body
			$scope.toggleTopicBody = function(topic) {
				if (topic.show_body === true){
					topic.show_body = false;
					topic.toggleClass = '';
				} else if (topic.show_body === false || !topic.show_body){
					topic.show_body = true;
					topic.toggleClass = 'collapse';
				}
			};

			$scope.getItemMediaCssClass = function(topic){
				css_class = '';
				if (topic.file_id){
					if (topic.w_error){
						css_class = 'w-error';
					} else {
						css_class = 'w-media';
					}
				}
				return css_class;
			};

		};

		// topic list template
		var template =  '<div class="topic-item row" ng-if="topic" files ng-init="getItemFile(topic)">' +
							'<div class="topic-item-wrapper" moderations ng-init="getItemModerations(topic)">' +
								'<div class="topic-item-left votes" votes ng-init="getTopicVotes(topic)" ng-class="userVoteCss(topic.vote_user)">' +
									'<a ng-click="onUpVoteTopic(topic)" class="vote-arrow arrow-up"></a>' +
									'<span class="votes-sum-total">{{topic.votes_sum}}</span>' +
									'<a ng-click="onDownVoteTopic(topic)" class="vote-arrow arrow-down"></a>' +
									'<div class="votes-bar">' +
									  '<span class="up-vote-bar" style="height:{{topic.uvp}}%;"></span>' +
									  '<span class="down-vote-bar" style="height:{{topic.dvp}}%;"></span>' +
									'</div>' +
								'</div>' +
							    '<div class="topic-item-main {{topic.body_class}}">' +
								    '<div class="topic-item-image {{topic.media_css_class}}" ng-class="getItemMediaCssClass(topic)">'+
								        '<figure class="{{topic.img_loaded}}"><a href="/{{page.site_info.address}}/index.html?view:topic+topic_id={{topic.topic_id}}" ng-if="topic.image_path"><img img-load="onImgLoad(topic)" fallback-src="assets/img/404-not-found.png" ng-src="{{topic.image_path}}"/></a></figure>' +
								    '</div>' +
								    '<div class="topic-item-body">' +
								      	'<div class="topic-item-header">' +
								      		'<label class="sticky-label fg-color-secondary" ng-if="channel.sticky_id === topic.topic_id">sticky</label>' +
								        	'<h3><a href="/{{page.site_info.address}}/index.html?view:topic+topic_id={{topic.topic_id}}">{{topic.title}}</a></h3>' +
								        	'<item-edit-toolbar ng-init="setItem(topic)"></item-edit-toolbar>' +
								      	'</div>' +
								        '<div class="topic-info in-list subtext-color">' +
								        	'<a class="toggle-btn {{topic.toggleClass}}" ng-click="toggleTopicBody(topic)"></a>' +
								        	'submitted <span am-time-ago="topic.added"></span> ' +
								        	'by <user-name ng-init="setUser(topic)"></user-name> ' +
								        	'to <a href="/{{page.site_info.address}}/index.html?view:channel+channel_id={{topic.channel_id}}">{{topic.name}}</a>' +
								        	' (<span class="votes-up">+{{topic.votes_up}}</span><b>|</b><span class="votes-down">-{{topic.votes_down}}</span>)' +
								        '</div>' +
								        '<div class="topic-bottom"> ' +
								          '<a href="index.html?view:topic+topic_id={{topic.topic_id}}#comment-list"><b>{{topic.comments_total - topic.hidden_comments_total}} comments</b></a>' +
								        '</div>' +
								        '<div class="topic-body" ng-show="topic.show_body">' +
								          '<article ng-if="topic.body" class="fg-color-secondary">' +
									          '<div contenteditable="false" ta-bind="ta-bind" ng-model="topic.body"></div>' +
								          '</article>' +
									      '<figure ng-if="topic.image" class="{{topic.img_loaded}}" ng-class="getItemMediaCssClass(topic)"><img fallback-src="assets/img/404-not-found.png" img-load="onImgLoad(topic)" ng-if="topic.image" ng-src="{{topic.image_path}}"/></figure>' +
									      '<div ng-if="topic.video"><video-player ng-init="initVideoPlayer(topic.player)"></video-player></div>' +
								        '</div>' +
								    '</div>' +
							    '</div>' +
						    '</div>' +	
						'</div>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);