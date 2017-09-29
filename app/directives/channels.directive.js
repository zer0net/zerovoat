app.directive('channels', [
	function() {

		// channel list controller
		var controller = function($scope,$element) {
			
			// get channels
			$scope.getChannels = function (user_id) {
				$scope.loading = true;
				var query = ["SELECT * FROM channel WHERE name IS NOT NULL"];
				if (user_id) query = ["SELECT * FROM channel WHERE name IS NOT NULL AND user_id='"+user_id+"'"]; 
				Page.cmd("dbQuery", query, function(channels) {
					$scope.$apply(function(){
						$scope.channels = channels;
						$scope.loading = false;
					});
				});
			};

			// get channels
			$scope.getModeratedChannels = function (user_id) {
				$scope.loading = true;
				var query = ["SELECT * FROM moderator WHERE name IS NOT NULL AND user_name='"+user_id+"'"];
				Page.cmd("dbQuery", query, function(moderator) {
					var channels = [];
					moderator.forEach(function(mod,index){
						channel_id = "'"+mod.channel_id+"'";
						channels.push(channel_id);
					});
					var query = ["SELECT * FROM channel WHERE name IS NOT NULL AND channel_id IN ("+channels+")"];
					Page.cmd("dbQuery", query, function(channels) {
						$scope.$apply(function(){
							$scope.channels = channels;
							$scope.loading = false;
						});
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