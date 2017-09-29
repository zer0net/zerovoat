app.directive('itemEmbed', ['File',
	function(File) {

		// item embed controller
		var controller = function($scope,$element) {

			$scope.initItemEmbed = function(item){
				var file = {
					embed_url:item.embed_url,
					file_type:$scope.splitByLastDot(item.embed_url)
				};
				$scope.file = File.configFileMediaType(file);
				$scope.file = File.renderFileMediaDisplay(file,$scope.config,$scope.page.site_info.address);
				$scope.file.site_file = File.getEmbedSiteFileRecord(file,$scope.clusters,$scope.sites);
				$scope.file.file_path = 'merged-CDN/'+$scope.file.site_file.cluster_id+'/'+$scope.file.site_file.inner_path;
				console.log($scope.file.site_file);
			};

			$scope.splitByLastDot = function(text){
			    var index = text.lastIndexOf('.');
			    var file_type = [text.slice(0, index), text.slice(index + 1)];
			    file_type = file_type[1].toLowerCase()
			    return file_type;
			};

		};

		var template =  '<div class="item-embed">' +
							'<figure ng-if="file.image" class="topic-image">' +
						        '<img fallback-src="assets/img/404-not-found.png" img-load="onImgLoad(file)" ng-src="{{file.file_path}}"/>' +
						    '</figure>' +
						    '<div ng-if="file.video" class="topic-video-container">' +
						        '<video-player ng-init="initVideoPlayer(file.player)"></video-player>' +
						    '</div>' +
						    '<span class="media-item-peers-count">Peers: <span ng-if="file.site_file.peer > 0">{{file.site_file.peer}}</span><span ng-if="!file.site_file.peer">0</span></span>' +						    
						'</div>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);