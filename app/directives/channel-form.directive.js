app.directive('channelForm', [
	function() {

		// channel form controller
		var controller = function($scope,$element) {
			
			// init channel form
			$scope.initChannelForm = function () {
				if ($scope.view === 'new'){
					$scope.mode = 'new';
					$scope.info_text = 'You are creating a new channel'
				} else if ($scope.view === 'edit') {
					$scope.selected = '';
					$scope.mode = 'edit';
					$scope.info_text = 'You are editing the channel '+$scope.channel.name;
				}
			};

			// get channel moderators
			$scope.getChannelModerators = function(channel){
				var query = ["SELECT * FROM moderator WHERE channel_id='"+channel.channel_id+"'"];
				Page.cmd("dbQuery", query, function(moderators) {
					$scope.moderators = moderators;
					console.log(moderators);
					$scope.$apply();
				});			
			};

			// on create channel
			$scope.onCreateChannel = function(channel){
				$scope.loading = true;
				$scope.createChannel(channel);
			};

			// on update channel
			$scope.onUpdateChannel = function(channel,moderators){
				$scope.loading = true;
				$scope.updateChannel(channel,moderators);
			};

		};

		var template = '<section ng-init="initChannelForm()" id="channel-form" class="form">' +
						    '<div class="well"><span>{{info_text}}</span></div>' +
						    '<div class="form-field row">' +
						      '<label class="col-xs-2">Name</label>' +
						      '<div class="col-xs-10">' +
						        '<input class="form-control" ng-model="channel.name"/>' +
						      '</div>' +
						    '</div>' +
						    '<div class="form-field row">' +
						      '<label class="col-xs-2">Description</label>' +
						      '<div class="col-xs-10">' +
						        '<input class="form-control"  ng-model="channel.description"/>' +
						      '</div>' +
						    '</div>' +						    
						    '<div class="form-field row">' +
						      '<div class="col-xs-offset-2 col-xs-10">' +
						        '<button ng-hide="loading" ng-if="mode === \'new\'" class="btn primary-btn" ng-click="onCreateChannel(channel)">submit</button>' +
						        '<button ng-hide="loading" ng-if="mode === \'edit\'" class="btn primary-btn" ng-click="onUpdateChannel(channel,moderators)">update</button>' +
						        '<span ng-show="loading" class="loader"></span>' + 
						      '</div>' +
						    '</div>' +
						'</section>';

		return {
			restrict: 'E',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);