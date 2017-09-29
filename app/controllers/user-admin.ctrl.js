app.controller('UserAdminCtrl', ['$scope','$location',
	function($scope,$location) {

		// init
		$scope.init = function(){
			// get user
			var query = ["SELECT * FROM user WHERE user_id='"+$scope.page.site_info.auth_address+"'"];
			Page.cmd("dbQuery", query, function(user) {
				$scope.user = user[0];
				$scope.getModerator();
				$scope.$apply();
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