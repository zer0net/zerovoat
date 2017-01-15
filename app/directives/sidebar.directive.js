app.directive('sidebar', ['$rootScope',
	function($rootScope) {

		// topic list controller
		var controller = function($scope,$element) {
			$scope.init = function(){
				console.log($scope.channel);
			};
		};

		// topic list template
		var template = '<aside ng-init="init()" class="main-sidebar">' +
							'<div class="row">'+
								'<div ng-if="channel" class="sidebar-channel col-xs-12">'+
									'<h2>{{channel.name}}</h2>' +
									'<div class="well">{{channel.description}}</div>'+
	 							'</div>' +
	 							'<hr ng-if="channel" style="float: left;width: 100%;"/>' +
								'<ul class="col-xs-12">' +
									'<li ng-if="!page.site_info.cert_user_id"><a ng-click="selectUser()" class="blue">login</a> to participate</li>' +
									'<li ng-if="!page.site_info.cert_user_id"><hr/></li>' +
									'<li ng-if="page.site_info.cert_user_id" ng-show="!channel">' +
										'<a class="btn" href="new.html?channel">Create New Channel</a>' +
									'</li>' +
									'<li><a class="btn" href="/{{page.site_info.address}}/?channels">Channels</a></li>' +
								'</ul> ' +
							'</div>' +
						'</aside>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);