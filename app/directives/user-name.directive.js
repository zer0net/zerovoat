app.directive('userName', ['$sce',
	function($sce) {

		var controller = function($scope,$element){
			$scope.setUser = function(item){
				$scope.user = {
					user_name:item.user_name,
					user_id:item.user_id
				}
				$scope.userPopover = $scope.user.user_id;
			};
		};

		var template =	'<span class="user-name" uib-popover="{{userPopover}}" popover-title="{{user.user_id.split(\'@\')[0]}}" popover-trigger="\'mouseenter\'">{{user.user_id.split(\'@\')[0]}}</span>';

		return {
			restrict: 'AE',
			replace:true,
			controller: controller,
			template:template
		}

	}
]);