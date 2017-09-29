app.directive('topicForm', ['$rootScope',
	function($rootScope) {

		// topic form controller
		var controller = function($scope,$element) {

			// init topic form
			$scope.initTopicForm = function () {
				$scope.item_type = 'topic';
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
				$scope.loading = false;
			};

			// pre create item
			$scope.preCreateItem = function(topic){
				$scope.loading = true;
				$scope.onCreateItem(topic);
			};

			// pre create item
			$scope.preUpdateItem = function(topic){
				$scope.loading = true;
				$scope.onUpdateItem(topic);
			};

		};

		var template = '<section ng-init="initTopicForm()" id="topic-form" class="form">' +
						    '<form name="form" class="well" class="css-form" novalidate files ng-init="getItemFile(topic)">' +
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
								      '<label class="col-xs-2">Text</label>' +
								      '<div class="col-xs-10">' +
								        '<text-angular name="topic_body" ng-model="topic.body"></text-angular>' +
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
								    '<hr ng-if="view === \'edit\'"/>' +								    
								    '<div class="form-field row" ng-if="view === \'edit\'">' +
								      	'<label class="col-xs-2">Current File</label>' +								    	
								        '<div class="col-xs-10" ng-show="topic.file" >' +
								      		'<img style="width:100%;" ng-src="{{topic.image_path}}"/>' +
											'<div ng-if="topic.video"><video-player ng-init="initVideoPlayer(topic.player)"></video-player></div>' +
								        '</div>' +
								    '</div>' +
								    '<div class="form-field row" ng-init="initFileUpload(topic)">' +
								      '<label class="col-xs-2">Embed url</label>' +
								      '<div class="col-xs-10">' +
								        '<input class="form-control" ng-model="topic.embed_url" name="Embed url"/>' +
								      '</div>' +
								    '</div>' +		      
								    '<hr/>' +
								    /*'<file-browser></file-browser>' + */
								    '<div class="form-field row">' +
								      '<div class="col-xs-offset-2 col-xs-10">' +
								        '<button ng-hide="loading" ng-if="view === \'new\'" class="btn primary-btn" ng-click="preCreateItem(topic)">submit</button>' +
								        '<button ng-hide="loading" ng-if="view === \'edit\'" class="btn primary-btn" ng-click="preUpdateItem(topic)">update</button>' +						      
								        '<button ng-hide="loading" ng-if="view === \'moderate\'" class="btn primary-btn" ng-click="preModerateItem(topic)">moderate</button>' +						      
								        '<span ng-show="loading" class="loader"></span>' + 
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