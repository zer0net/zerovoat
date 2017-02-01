app.directive('sectorForm', [
	function() {

		// channel form controller
		var controller = function($scope,$element) {
			
			// init channel form
			$scope.initSectorForm = function () {
				if ($scope.view === 'new'){
					$scope.mode = 'new';
					$scope.info_text = 'You are creating a new sector';
				} else if ($scope.view === 'edit') {
					$scope.selected = '';
					$scope.mode = 'edit';
					$scope.info_text = 'You are editing the sector '+$scope.sector.name;
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

		};

		var template = '<section ng-init="initSectorForm()" id="channel-form" class="form">' +
						    '<div class="well"><span>{{info_text}}</span></div>' +
						    '<div class="form-field row">' +
						      '<label class="col-xs-2">Name</label>' +
						      '<div class="col-xs-10">' +
						        '<input class="form-control" ng-model="sector.name"/>' +
						      '</div>' +
						    '</div>' +
						    '<div class="form-field row">' +
						      '<label class="col-xs-2">Description</label>' +
						      '<div class="col-xs-10">' +
						        '<input class="form-control" ng-model="sector.description"/>' +
						      '</div>' +
						    '</div>' +						    
						    '<div class="form-field row">' +
						      '<div class="col-xs-offset-2 col-xs-10">' +
						        '<button ng-if="mode === \'new\'" class="btn primary-btn" ng-click="createSector(sector)">submit</button>' +
						        '<button ng-if="mode === \'edit\'" class="btn primary-btn" ng-click="updateSector(channel,moderators)">update</button>' +
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