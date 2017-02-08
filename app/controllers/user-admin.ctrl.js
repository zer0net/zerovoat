app.controller('UserAdminCtrl', ['$scope','$location',
	function($scope,$location) {

		// init
		$scope.init = function(){
			// get moderator
			var query = ["SELECT * FROM user WHERE user_id='"+$scope.page.site_info.auth_address+"'"];
			Page.cmd("dbQuery", query, function(user) {
				$scope.user = user[0];
				// admin section
				if ($scope.view === 'user-admin'){
					$scope.admin_section = $location.$$absUrl.split('&')[0].split('section=')[1];
					$scope.$apply();
					console.log($scope.admin_section);
				} else if ($scope.view === 'moderate' || $scope.view === 'edit' && $scope.section === 'channel'){
					$scope.getModerator();
				}
			});	
		};

		$scope.getModerator = function(){
			// get moderator
			var query = ["SELECT * FROM moderator WHERE user_name='"+$scope.user.user_name+"'"];
			Page.cmd("dbQuery", query, function(moderator) {
				$scope.moderator = moderator[0];
				$scope.$apply();
			});		
		};

	}
]);