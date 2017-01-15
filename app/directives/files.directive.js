app.directive('files', ['$rootScope',
	function($rootScope) {

		// files directive controller
		var controller = function($scope,$element) {

			// init file upload
			$scope.initFileUpload = function(item){
				// upload btn text
				$scope.upload_btn_text = 'choose file or drag and drop file here';
				// file upload config
				$scope.fileUploadConfig = {
					// ignore
				    'options': { // passed into the Dropzone constructor
				      'url': 'upload.php'
				    },
					'eventHandlers': {
						'sending': function (file, xhr, formData) {
							// function to be triggerd upon file add
							$scope.readFile(item,file);
						}
					}
				};
			};

			// read file
			$scope.readFile = function(item,file){
				// reader instance
				$scope.reader = new FileReader();
				// reader onload
				$scope.reader.onload = function(){
					// file
					$scope.file = file;
					// file name
					var file_name = $scope.file.name.split(' ').join('_').normalize('NFKD').replace(/[\u0300-\u036F]/g, '').replace(/ß/g,"ss");
					// get file type
					var splitByLastDot = function(text) {
					    var index = text.lastIndexOf('.');
					    return [text.slice(0, index), text.slice(index + 1)]
					}
					// topic file
					item.file = {
						data_uri:this.result,
						file_type:splitByLastDot(file.name)[1],
						name:file_name
					};
					// change btn text
					$scope.upload_btn_text = file_name;
					// get file media type
					item = $scope.getFileMediaType(item);
					// apply to scope
					$scope.$apply();
				};
				// reader read file
				$scope.reader.readAsDataURL(file);
			};

			// get items file
			$scope.getItemFile = function(item){
				// find items type & id name filed
				var item_type,
					item_id;
				for (var i in item){
					if (i.indexOf('comment_id') > -1){
						item_type = 'comment';
						item_id = 'comment_id';
					} else if (i.indexOf('topic_id') > -1){
						item_type = 'topic';
						item_id='topic_id';
					}
				}
				// get file by item type & item id
				var query = ["SELECT * FROM file WHERE item_type='"+item_type+"' AND item_id='"+item[item_id]+"' ORDER BY added"];
				Page.cmd("dbQuery", query, function(file) {
					console.log(file);
					if (file.length > 0){
						item.file = file[0];
						$scope.renderFile(item);
					}
				}); 
			};

			// render file
			$scope.renderFile = function(item){
				item = $scope.getFileMediaType(item);
			};

			$scope.getFileMediaType = function(item){
				if (item.file.file_type === 'png' ||
					item.file.file_type === 'gif' ||
					item.file.file_type === 'jpeg'||
					item.file.file_type === 'jpg'){
					item.image = true;
					item.image_path = '/' + $scope.page.site_info.address + '/data/users/' + item.file.user_id + '/' + item.file.file_name;
				} else if (item.file.file_type === 'mp4' ||
				    item.file.file_type === 'mov' ||
				    item.file.file_type === 'mpeg'||
				    item.file.file_type === 'avi' ||
				    item.file.file_type === 'ogg') {
					item.video = true;
					var sources;
					if ($scope.view === 'new'){
						sources = [
							{
								src:item.file.data_uri,
								type:'video/'+item.file.file_type
							}
						];
					} else {
						sources = [
							{
								src:'/' + $scope.page.site_info.address + '/data/users/' + item.file.user_id + '/' + item.file.file_name,
								type:'video/'+item.file.file_type
							}
						];
					}
					item.player = {
						autoPlay:false,
						sources: sources,
						theme: "/" + $scope.page.site_info.address + "/assets/lib/videos/videogular-themes-default/videogular.css"
					};
				}
				return item;
			};

			// on create item
			$scope.onCreateItem = function(item){
				if (item.file){
					var msg = 'uploading file';
					$scope.showLoadingMsg(msg);
					$scope.createFile(item);
				} else {
					$scope.routeItem(item);
				}
			};

			// on update item
			$scope.onUpdateItem = function(item){
				if (item.file){
					var msg = 'uploading file';
					$scope.showLoadingMsg(msg);
					$scope.createFile(item);
				} else {
					$scope.routeItem(item);
				}
			};

			// route item
			$scope.routeItem = function(item){
				if ($scope.section === 'channel'){
					if ($scope.view === 'new'){
						$scope.createChannel(item);
					} else if ($scope.view === 'edit'){
						$scope.updateCahnnel(item);
					}
				} else if ($scope.section === 'topic'){
					console.log($scope.section);
					if ($scope.view === 'new'){
						console.log($scope.view);
						$scope.createTopic(item);
					} else if ($scope.view === 'edit'){
						$scope.updateTopic(item);
					}
				} else {
					$scope.createComment(item);
				}
			};

			// create file
			$scope.createFile = function(item){
				// inner path to user's data.json file
				var inner_path = 'data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.file){
							data.file = [];
							data.next_file_id = 1;
						}
					} else { 
						data = { 
							next_file_id:1, 
							file:[] 
						}; 
					}
					// find items type & id name filed
					var item_id,
						item_type;
					if ($scope.section === 'channel'){
						item_type = $scope.section;
						if (!data.next_channel_id){
							item_id = 1;
						} else {
							item_id = data.next_channel_id;
						}
					} else if ($scope.section === 'topic'){
						item_type = $scope.section;
						if (!data.next_topic_id){
							item_id = 1;
						} else {
							item_id = data.next_topic_id;
						}
					} else {
						item = data.next_comment_id;
						if (!data.next_comment_id){
							item_id = 1;
						} else {
							item_id = data.next_comment_id;
						}
					}
					// save data uri
					var data_uri = item.file.data_uri.split('base64,')[1];
					// new file entry
					file = {
						file_id:$scope.page.site_info.auth_address + data.next_file_id.toString(),
						item_type:item_type,
						item_id:$scope.page.site_info.auth_address + item_id.toString(),
						file_type:item.file.file_type,
						file_name:item.file.name,
						user_id:$scope.page.site_info.auth_address,
						added:+(new Date)
					};
					// add file to users files
					data.file.push(file);
					// update next file id #
					data.next_file_id += 1;
					console.log(data);
					// upload file
					var file_path = 'data/users/' + $scope.page.site_info.auth_address + '/' + file.file_name;
					Page.cmd("fileWrite", [file_path, data_uri], function(res) {
						console.log(res);
						// write to file
						var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
						Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
							console.log(res);
							// sign & publish site
							Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
								console.log(res);
								// apply to scope
								$scope.$apply(function() {
									Page.cmd("wrapperNotification", ["done", "File Uploaded!", 10000]);
									$scope.routeItem(item);
								});
							});
						});
					});
				});
			};

			// show loading msg
			$scope.showLoadingMsg = function(msg){
				$scope.loading = true;
				$scope.msg = msg;
			};

			// finish loading
			$scope.finishLoading = function(){
				$scope.loading = false;
			};


		};

		return {
			restrict: 'AE',
			replace:false,
			controller: controller
		}

	}
]);