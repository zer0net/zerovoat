app.directive('topicMediaItem', [
	function() {

		// topic media item controller
		var controller = function($scope,$element) {
			$scope.getItemMediaCssClass = function(topic){
				var css_class = '';
				if (topic.file_id){
					css_class = 'w-media';
				}
				return css_class;
			};
		};

		var template =  '<div class="topic-media-item-container" ng-class="getItemMediaCssClass(topic)">' +
							'<figure ng-if="topic.image" class="topic-image {{topic.img_loaded}}">' +
						        '<img fallback-src="assets/img/404-not-found.png" img-load="onImgLoad(topic)" ng-src="{{topic.image_path}}"/>' +
						    '</figure>' +
						    '<div ng-if="topic.video" class="topic-video-container">' +
						        '<video-player ng-init="initVideoPlayer(topic.player)"></video-player>' +
						    '</div>' +
						    '<span class="media-item-peers-count">Peers: <span ng-if="topic.file.site_file.peer > 0">{{topic.file.site_file.peer}}</span><span ng-if="!topic.file.site_file.peer">0</span></span>' +
						'</div>';
		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);