app.controller('UserAdminCtrl', ['$scope','$location',
	function($scope,$location) {

		// init
		$scope.init = function(){
			// user obj
			$scope.user = {
				user_id : $scope.page.site_info.cert_user_id
			};
			// admin section
			if ($scope.view === 'user-admin'){
				$scope.admin_section = $location.$$absUrl.split('&')[0].split('section=')[1];
			} else if ($scope.view === 'moderate'){
				$scope.getModerator();
			}
		};

		$scope.getModerator = function(){
			// get moderator
			var query = ["SELECT * FROM moderator WHERE user_name='"+$scope.user.user_id+"'"]
			Page.cmd("dbQuery", query, function(moderator) {
				$scope.moderator = moderator[0];
				console.log(moderator);
				$scope.$apply();
			});		
		};

	}
]);