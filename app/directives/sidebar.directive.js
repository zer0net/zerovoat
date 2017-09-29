app.directive('sidebar', ['$rootScope',
	function($rootScope) {

		// topic list controller
		var controller = function($scope,$element) {
			
			// init sidebar
			$scope.init = function(){
				if ($scope.view === 'main'){
					$scope.getLastestChannels();
				}
			};

			// get latest channels
			$scope.getLastestChannels = function(){
				var query = ["SELECT * FROM channel WHERE name NOT NULL ORDER BY -added LIMIT 5"];
				Page.cmd("dbQuery", query, function(channels) {
					$scope.channels = channels;
					$scope.$apply();
				});
			};

		};

		// topic list template
		var template = '<aside ng-init="init()" class="main-sidebar fg-color">' +
							'<div class="row">'+
								'<div ng-if="channel" class="sidebar-channel col-xs-12">'+
									'<h2>{{channel.name}}</h2>' +
									'<div class="well">{{channel.description}}</div>'+
									'<hr/>' + 
									'<span>ChanOp: {{channel.user_id.split("@")[0]}}</span>' +
	 							'</div>' +
								'<ul class="col-xs-12 main-section-sidebar-menu" ng-if="view === \'main\'">' +
									'<li><h3>Newest Channels</h3></li>' +
									'<li ng-repeat="channel in channels track by $index"><a class="btn" href="/{{page.site_info.address}}/index.html?view:channel+channel_id={{channel.channel_id}}"><span>{{channel.name}}</span></a></li>' +
									'<li><hr/></li>' +
									'<li><a class="btn" href="/{{page.site_info.address}}/index.html?view:channels">All Channels</a></li>' +
								'</ul> ' +
								'<div class="col-xs-12" ng-if="view === \'channels\'">' +
		                        	'<p style="text-transform:uppercase;">number of channels : {{channels.length}}</p>' +
		                        	'<ul style="padding:0;">' + 
									'<li ng-if="page.site_info.cert_user_id" ng-show="!channel">' +
										'<a class="btn" href="index.html?view:new+section:channel">Create New Channel</a>' +
									'</li>' +
									'</ul>' +
								'</div>' +
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