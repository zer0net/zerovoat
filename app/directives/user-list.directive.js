app.directive('userList', [
	function() {

		// user list controller
		var controller = function($scope,$element) {
			
			// get users
			$scope.getUsers = function () {
				var query = ["SELECT * FROM user"]; 
				Page.cmd("dbQuery", query, function(users) {
					console.log(users);
					$scope.$apply(function(){
						$scope.users = users;
					});
				});		
			};

			// get moderators
			$scope.getChannelModerators = function (channel) {
				var query = ["SELECT * FROM moderator WHERE channel_id='"+channel.channel_id+"'"]; 
				Page.cmd("dbQuery", query, function(moderators) {
					$scope.$apply(function(){
						$scope.moderators = moderators;
					});
				});		
			};

		};

		return {
			restrict: 'AE',
			replace:false,
			controller: controller
		}

	}
]);