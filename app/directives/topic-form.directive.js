app.directive('topicForm', ['$rootScope',
	function($rootScope) {

		// topic form controller
		var controller = function($scope,$element) {

			// init topic form
			$scope.initTopicForm = function () {
				if ($scope.view === 'new'){
					// init topic obj
					$scope.topic = {
						channel_id:$scope.channel.channel_id
					};
					// form obj
					$scope.form = {
						text:'You are submitting a text post',
					};	
				} else if ($scope.view === 'edit') {
					// form obj
					$scope.form = {
						text:'You are editing the topic ' + $scope.topic.title,
					};
				}
			};

		};

		var template = '<section ng-init="initTopicForm()" id="topic-form" class="form">' +
						    '<form name="form" class="well" class="css-form" novalidate files>' +
						    	'<div class="loading" ng-show="loading">' +
						    		'<span class="msg">{{msg}}</span>' +
						    		'<span class="loader"></span>' +
						    	'</div>' +
						    	'<div ng-hide="loading">' +
								    '<span>{{form.text}}</span>' +
								    '<div class="form-field row">' +
								      '<label class="col-xs-2">Title</label>' +
								      '<div class="col-xs-10">' +
								        '<input class="form-control" ng-model="topic.title" name="Title" required="" />' +
	      								'<div ng-show="form.$submitted || form.Title.$touched">' +
	      									'<div ng-show="form.Title.$error.required">Title is required.</div>' +
	      								'</div>' +
								      '</div>' +
								    '</div>' +
								    '<div class="form-field row">' +
								      '<label class="col-xs-2">Channel</label>' +
								      '<div class="col-xs-10">' +
								        '<select class="form-control" ng-model="topic.channel_id" channels ng-init="getChannels()">' +
								          '<option ng-repeat="ch in channels" value="{{ch.channel_id}}">{{ch.name}}</option>' +
								        '</select>' +
								      '</div>' +
								    '</div>' +
								    '<div class="form-field row">' +
								      '<label class="col-xs-2">Text</label>' +
								      '<div class="col-xs-10">' +
								        '<textarea class="form-control" ng-model="topic.body"></textarea>' +
								      '</div>' +
								    '</div>' +
								    '<div class="form-field row" ng-init="initFileUpload(topic)">' +
								      '<label class="col-xs-2">File</label>' +
								      '<div class="col-xs-10">' +
								        '<button class="form-control" ng-model="topic.file" dropzone="fileUploadConfig">{{upload_btn_text}}</button>' +
								      '</div>' +
								    '</div>' +						    
								    '<div class="form-field row">' +
								        '<div class="col-xs-offset-2 col-xs-10">' +
								      		'<img style="width:100%;" ng-src="{{topic.file.data_uri}}" ng-if="topic.image"/>' +
											'<div ng-if="topic.video"><video-player ng-init="initVideoPlayer(topic.player)"></video-player></div>' +
								        '</div>' +
								    '</div>' +
								    '<hr/>' +
								    '<div class="form-field row">' +
								      '<div class="col-xs-offset-2 col-xs-10">' +
								        '<button ng-if="view === \'new\'" class="btn primary-btn" ng-click="onCreateItem(topic)">submit</button>' +
								        '<button ng-if="view === \'edit\'" class="btn primary-btn" ng-click="onUpdateItem(topic)">update</button>' +						      
								      '</div>' +
								    '</div>' +
							    '</div>' +
						    '</form>' +
						'</section>';

		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);