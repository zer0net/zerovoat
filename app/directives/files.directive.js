app.directive('files', ['$rootScope','File',
	function($rootScope,File) {

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

			// init channel layout as item
			$scope.channelLayoutFileUpload = function(){
				$scope.item = $scope.channel;
				$scope.multiple_files = true;
			};

			// read file
			$scope.readFile = function(item,file){
				// reader instance
				$scope.reader = new FileReader();
				// reader onload
				$scope.reader.onload = function(){
					// file name
					var file_name = file.name.split(' ').join('_').normalize('NFKD').replace(/[\u0300-\u036F]/g, '').replace(/ß/g,"ss");
					file_name = file_name.replace(/([^a-z0-9]+)/gi, '-');
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
					item = File.getFileMediaType(item,$scope.page.site_info.address,$scope.view);
					// apply to scope
					console.log(item.file);
					$scope.$apply();
				};
				// reader read file
				$scope.reader.readAsDataURL(file);
			};

			// on read file
			$scope.onReadFile = function(file){
				$scope[$scope.item_type][file.model_name] = file.data_uri;
				if (!$scope.files) $scope.files = [];
				$scope.files.push(file);
			};

			// get items file
			$scope.getItemFile = function(item){
				// find items type & id name field
				var f= File.determineItemTypeId(item);				
				// get file by item type & item id
				var query = ["SELECT * FROM file WHERE item_type='"+f.item_type+"' AND item_id='"+item[f.item_id]+"' ORDER BY added"];
				Page.cmd("dbQuery", query, function(file) {
					if (file.length > 0){
						item.file = file[0];
						item = File.getFileMediaType(item,$scope.page.site_info.address,$scope.view);
					}
				}); 
			};

			// on create item
			$scope.onCreateItem = function(item){
				$scope.loading = true;
				if ($scope.files){
					$scope.filesIndex = 0;
					$scope.createFile(item,$scope.files[$scope.filesIndex]);
				} else {
					if (item.file){
						var msg = 'uploading file';
						$scope.showLoadingMsg(msg);
						$scope.createFile(item);
					} else {
						$scope.routeItem(item);
					}		
				}
			};

			// on update item
			$scope.onUpdateItem = function(item){
				$scope.loading = true;				
				if ($scope.files){
					$scope.filesIndex = 0;					
					$scope.createFile(item,$scope.files[$scope.filesIndex]);
				} else {
					if (item.file){
						var msg = 'uploading file';
						$scope.showLoadingMsg(msg);
						$scope.createFile(item);
					} else {
						$scope.routeItem(item);
					}
				}
			};

			// create file
			$scope.createFile = function(item,file){
				// if no file is passed seperately
				if (!file) file = item.file;
				// if file has model name, delete said model name from item to prevent saving data uri to json
				if (file.model_name) delete $scope[$scope.item_type][file.model_name];
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
					// save data uri
					var data_uri = file.data_uri.split('base64,')[1];
					// new file entry
					file = {
						file_id:$scope.page.site_info.auth_address + data.next_file_id.toString(),
						item_type:$scope.item_type,
						item_id:File.determineItemId(data,$scope),
						file_type:file.file_type,
						file_name:file.name + '.' + file.file_type,
						model_name:file.model_name,
						user_id:$scope.page.site_info.auth_address,
						added:+(new Date)
					};
					// add file to users files
					data.file.push(file);
					// update next file id #
					data.next_file_id += 1;
					console.log(file);
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
									if ($scope.files){
										$scope.createNextFile(item);
									} else {
										$scope.routeItem(item);
									}
								});
							});
						});
					});
				});
			};

			// create multiple files
			$scope.createNextFile = function(item){
				$scope.filesIndex += 1;
				if ($scope.files.length > $scope.filesIndex){
					$scope.createFile(item,$scope.files[$scope.filesIndex]);
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
						if ($scope.mode){
							if ($scope.mode === 'new'){
								$scope.onCreateLayout(item);
							} else if ($scope.mode === 'edit') {
								$scope.onUpdateLayout(item);
							}
						} else {
							$scope.updateCahnnel(item);
						}
					}
				} else if ($scope.section === 'topic'){
					if ($scope.view === 'new'){
						$scope.createTopic(item);
					} else if ($scope.view === 'edit'){
						$scope.updateTopic(item);
					}
				} else {
					$scope.createComment(item);
				}
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