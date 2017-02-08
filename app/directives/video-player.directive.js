app.directive('videoPlayer', ['$sce','$timeout',
	function($sce,$timeout) {

		// video interface player
		var controller = function($scope,$element) {
			// init video player
			$scope.initVideoPlayer = function(player){
				$scope.player = player;
			};
			// on player ready
			$scope.onPlayerReady = function($API){
				// console.log($API);
			};
		};

		var template =	'<videogular ng-if="player"' +
							'vg-auto-play="player.autoPlay" ' +
							'vg-player-ready="onPlayerReady($API)" ' +
							'vg-error="onPlayerError($event)"' +
							'vg-theme="player.theme" ' +
							'class="{{screenSize}}"' +
							'style="width:100%; height:400px;">' +
							'<vg-media vg-src="player.sources" vg-tracks="player.tracks"></vg-media>' +
							'<vg-controls>' +
								'<vg-play-pause-button></vg-play-pause-button>' +
								'<vg-time-display>{{ currentTime | date:"mm:ss" }}</vg-time-display>' +
								'<vg-scrub-bar>' +
									'<vg-scrub-bar-buffer ng-if="!player.Buffer"></vg-scrub-bar-buffer>' +
									'<div class="vg-scrub-bar-buffered" ng-if="player.Buffer" style="width:{{video.loadingPercent}}%;"></div>' +
									'<vg-scrub-bar-current-time></vg-scrub-bar-current-time>' +
								'</vg-scrub-bar>' +
								'<vg-time-display>{{ timeLeft | date:"mm:ss" }}</vg-time-display>' +
								'<vg-volume>' +
									'<vg-mute-button></vg-mute-button>' +
									'<vg-volume-bar></vg-volume-bar>' +
								'</vg-volume>' +
								'<vg-fullscreen-button ng-click="onFullScreenClick()"></vg-fullscreen-button>' +
							'</vg-controls>' +
							'<vg-poster vg-url="player.plugins.poster" ng-if="player.plugins"></vg-poster>' +
							'<vg-overlay-play ng-hide="player.error"></vg-overlay-play>' +
							'<vg-buffering></vg-buffering>' +
						'</videogular>';

		return {
			restrict: 'AE',
			replace:true,
			controller: controller,
			template:template
		}

	}
]);