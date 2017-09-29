app.controller('TopicsCtrl', ['$scope','$location','$window','$rootScope','$sce','Item',
	function($scope,$location,$window,$rootScope,$sce,Item) {

		// get topic by url params
		$scope.getTopic = function() {
			$scope.loading = true;
			var query = Item.generateTopicQuery($location.$$absUrl);
			Page.cmd("dbQuery", query, function(topic) {
				$scope.topic = topic[0];
				console.log($scope.topic);
				if ($scope.topic.channel_id){
					$scope.getChannel($scope.topic);					
				}
				$scope.loading = false;
			});
		};

		// create topic
		$scope.createTopic = function(topic){
			var msg = 'creating topic';
			$scope.showLoadingMsg(msg);
			// inner path to user's json files
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get data.json
			Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
				// render data
				if (data){ 
					data = JSON.parse(data);
					if (!data.topic){
						data.topic = [];
						data.next_topic_id = 1;
					}
				} else { 
					data = { 
						next_topic_id:1, 
						topic:[] 
					}; 
				}
				// new topic entry
				topic = {
					topic_id:$scope.page.site_info.auth_address + "topic" + data.next_topic_id.toString(),
					channel_id:topic.channel_id,
					title:topic.title,
					body:topic.body,
					embed_url:topic.embed_url,					
					type:'topic',
					added:+(new Date)
				};
				
				if (topic.body){
					topic.body_p = topic.body.replace(/<\/?[^>]+(>|$)/g, "");
				} else {
					topic.body_p = '';
				}

				// user id
				if ($scope.page.site_info.cert_user_id){ topic.user_id = $scope.page.site_info.cert_user_id; } 
				else { topic.user_id = $scope.page.site_info.auth_address; }				
				// add topic to user's topics
				data.topic.push(topic);
				// update next topic id #
				data.next_topic_id += 1;
				// write to file
				var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
				Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
					console.log(res);
					// sign & publish site
					Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
						console.log(res);
						// apply to scope
						$scope.$apply(function() {
							Page.cmd("wrapperNotification", ["done", "Topic Created!", 10000]);
							var link = '/'+ $scope.page.site_info.address +'/index.html?view:topic+topic_id='+topic.topic_id;
							$scope.updateContentJson(link);
						});
					});
				});
			});
		};
		
		// update topic
		$scope.updateTopic = function(topic){
			// inner path to user's data.json file
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
			// get data.json
			Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
				data = JSON.parse(data);
				// get topic's index
				var topicIndex;
				data.topic.forEach(function(tp,index){
					if (tp.topic_id === topic.topic_id){
						topicIndex = index;
					}
				});	

				var u_topic = {
					topic_id:topic.topic_id,
					channel_id:topic.channel_id,
					user_id:topic.user_id,
					title:topic.title,
					body:topic.body,
					body_p:topic.body.replace(/<\/?[^>]+(>|$)/g, ""),
					embed_code:topic.embed_code,
					type:'topic',
					added:topic.added
				};
				// remove & re-add topic to user's topics
				data.topic.splice(topicIndex,1);
				data.topic.push(u_topic);
				// write to file
				var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
				Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
					console.log(res);
					// sign & publish site
					Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
						console.log(res);
						// apply to scope
						$scope.$apply(function() {
							Page.cmd("wrapperNotification", ["done", "Topic Updated!", 10000]);
							$window.location.href = '/'+ $scope.page.site_info.address +'/index.html?view:topic+topic_id='+topic.topic_id;
						});
					});
				});
			});
		};

		// on rootscope create topic
		$rootScope.$on('createTopic',function(event,mass){
			$scope.createTopic(mass);
		});

		// show loading msg
		$scope.showLoadingMsg = function(msg){
			$scope.loading = true;
			$scope.msg = msg;
		};

		// finish loading
		$scope.finishLoading = function(){
			$scope.loading = false;
		};

	}
]);