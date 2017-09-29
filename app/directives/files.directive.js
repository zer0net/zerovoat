app.directive('files', ['$rootScope','File',
	function($rootScope,File) {

		// files directive controller
		var controller = function($scope,$element) {

			// init file upload
			$scope.initFileUpload = function(item){
				if (item.file) delete item.file;
				if (item.video) delete item.video;
				if (item.image) delete item.image;
				// upload btn text
				$scope.upload_btn_text = 'choose file or drag and drop file here';
				$scope.comment_file_add_text = 'add file';
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
					item.userId = $scope.page.site_info.auth_address;
					item.file_name = item.file.name;
					item = File.getFileMediaType(item,item.file.file_type,$scope.page.site_info.address,$scope.view);
					// apply to scope
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
				var i = File.determineItemTypeId(item);
				if (item.file_id){
					var query = File.generateGetFileQuery(item.file_id,item.cluster_id);
					Page.cmd("dbQuery",query,function(file){
						if (file.length > 0){
							item.file = file[0];
							item.file_name = file[0].file_name;
							item.file.cluster_id = item.cluster_id;
							if (item.cluster_id && item.cluster_id !== '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'){
								if (item.file.item_id) item.file.user_id = item.file.item_id.split('_')[1];
							}
							item = File.getFileMediaType(item,item.file.file_type,$scope.page.site_info.address,$scope.view);
							item.file.site_file = File.getSiteFileRecord(item.file,item.userId,$scope.site_files,$scope.config,$scope.sites,$scope.clusters);
							if (!item.file.site_file){
								$scope.forceFileDownload(item.file);
							}
						}
						$scope.$apply();
					});
				} else {
					var query = ["SELECT * FROM file_to_item WHERE item_id='"+item[i.item_id]+"' AND item_type='"+i.item_type+"'"];
					Page.cmd("dbQuery",query,function(fti){
						$scope.$apply(function(){
							if (fti.length > 0){
								item.file_id = fti[0].file_id;
								$scope.getItemFile(item);
							}
						});
					});
				}
			};

			// force file download
			$scope.forceFileDownload = function(file){
				// xhttp get file
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + file.user_id + '/' + file.file_name;
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState === 4){
						// console.log('file ready');
					} else {
						// console.log("file not found!");
					}
				};
				xhttp.open("GET", inner_path, true);
				xhttp.send();
			};

			// on create item
			$scope.onCreateItem = function(item,parent){
				item.loading = true;
				if ($scope.files){
					$scope.filesIndex = 0;
					$scope.createFile(item,$scope.files[$scope.filesIndex]);
				} else {
					if (item.file){
						if (item.file.data_uri){
							var msg = 'uploading file';
							$scope.showLoadingMsg(msg);
							$scope.createFile(item,item.file,parent);
						} else {
							var msg = 'embeding file';
							$scope.showLoadingMsg(msg);
							$scope.createFileToTopic(item,item.file,parent);
						}
					} else {
						console.log('route item');
						$scope.routeItem(item,parent);
					}		
				}
			};

			// on update item
			$scope.onUpdateItem = function(item,parent){
				$scope.loading = true;				
				if ($scope.files){
					$scope.filesIndex = 0;					
					$scope.createFile(item,$scope.files[$scope.filesIndex]);
				} else {
					if (item.file){
						if (item.file.data_uri){
							var msg = 'uploading file';
							$scope.showLoadingMsg(msg);
							$scope.createFile(item,item.file,parent);
						} else {
							var msg = 'embeding file';
							$scope.showLoadingMsg(msg);
							$scope.createFileToTopic(item,item.file,parent);
						}
					} else {
						$scope.routeItem(item,parent);
					}
				}
			};

			// create file
			$scope.createFile = function(item,file,parent){
				// if no file is passed seperately
				if (!file) file = item.file;
				// if file has model name, delete said model name from item to prevent saving data uri to json
				if (file.model_name) delete $scope[$scope.item_type][file.model_name];
				// inner path to user's json files
				var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json' 				
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get content.json
				Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
					content_json = JSON.parse(content_json);
					if (!content_json.optional) content_json.optional = "((?!json).)*$";
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

						// next itemtype id
						var next_itemtype_id;
						if (data['next_'+$scope.item_type+'_id']){
							next_itemtype_id = data['next_'+$scope.item_type+'_id'].toString();
						} else {
							next_itemtype_id = 0;
						}

						// new file entry
						file = {
							file_id:$scope.page.site_info.auth_address + "fl" + data.next_file_id.toString(),
							item_type:$scope.item_type,
							item_id:$scope.page.site_info.auth_address + next_itemtype_id,
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
						// upload file
						var file_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/' + file.file_name;
						Page.cmd("fileWrite", [file_path, data_uri], function(res) {
							// update content.json
							var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
							Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
								// update data.json
								var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
								Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
									console.log(res);
									// sign & publish site
									Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
										console.log(res);
										// apply to scope
										$scope.$apply(function() {
											Page.cmd("wrapperNotification", ["done", "File Uploaded!", 10000]);
											$scope.createFileToTopic(item,file,parent);
										});
									});
								});
							});
						});
					});
				});
			};

			// create multiple files
			$scope.createNextFile = function(item,parent){
				$scope.filesIndex += 1;
				if ($scope.files.length > $scope.filesIndex){
					$scope.createFile(item,$scope.files[$scope.filesIndex],parent);
				} else {
					$scope.routeItem(item,parent);
				}
			};

			// create file to topic
			$scope.createFileToTopic = function(item,file,parent){
				// if no file is passed seperately
				if (!file) file = item.file;
				// if file has model name, delete said model name from item to prevent saving data uri to json
				if (file.model_name) delete $scope[$scope.item_type][file.model_name];
				// inner path to user's json files
				var inner_cj_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json' 				
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get content.json
				Page.cmd("fileGet", { "inner_path": inner_cj_path, "required": false },function(content_json) {
					content_json = JSON.parse(content_json);
					if (!content_json.optional) content_json.optional = "((?!json).)*$";
					// get data.json
					Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
						// render data
						if (data){ 
							data = JSON.parse(data);
							if (!data.file_to_item){
								data.file_to_item = [];
								data.next_file_to_item_id = 1;
							}
						} else { 
							data = { 
								next_file_to_item_id:1, 
								file_to_item:[] 
							}; 
						}

						var next_itemtype_id;
						if (data['next_'+$scope.item_type+'_id']){
							next_itemtype_id = data['next_'+$scope.item_type+'_id'].toString();
						} else {
							next_itemtype_id = 1;
						}

						var item_id;
						if (!item[$scope.item_type + '_id']){
							item_id = $scope.page.site_info.auth_address + $scope.item_type + next_itemtype_id;
						} else {
							item_id = item[$scope.item_type + '_id'];
						}

						// new file entry
						file_to_item = {
							file_to_item_id:$scope.page.site_info.auth_address + "fti" + data.next_file_to_item_id.toString(),
							item_type:$scope.item_type,
							item_id:item_id,
							file_id: file.file_id,
							cluster_id: file.cluster_id,
							model_name:file.model_name,
							user_id:$scope.page.site_info.auth_address,
							added:+(new Date)
						};
						// add file to users files
						data.file_to_item.push(file_to_item);
						// update next file id #
						data.next_file_to_item_id += 1;
						// upload file
						var file_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/' + file.file_name;
						// update content.json
						var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
						Page.cmd("fileWrite", [inner_cj_path, btoa(json_raw)], function(res) {
							// update data.json
							var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
							Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
								console.log(res);
								// sign & publish site
								Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
									console.log(res);
									// apply to scope
									$scope.$apply(function() {
										$scope.routeItem(item,parent,file);
									});
								});
							});
						});
					});
				});				
			};

			// route item
			$scope.routeItem = function(item,parent,file){
				if ($scope.view === 'new'){
					if ($scope.section === 'channel'){
						$scope.createChannel(item);
					} else if ($scope.section === 'topic'){
						$scope.createTopic(item);						
					}
				} else if ($scope.view === 'edit'){
					if ($scope.section === 'channel'){
						if ($scope.mode){
							if ($scope.mode === 'new'){
								$scope.onCreateLayout(item);
							} else if ($scope.mode === 'edit') {
								$scope.onUpdateLayout(item);
							}
						} else {
							$scope.updateCahnnel(item);
						}
					} else if ($scope.section === 'topic'){
						$scope.updateTopic(item);
					}					
				} else if ($scope.view === 'topic'){
					if (parent){
						var mass = {
							item:item,
							parent:parent,
							file:file
						};
						$rootScope.$broadcast('postReply',mass);
					} else {
						item.file = file;
						$rootScope.$broadcast('postComment',item);
					}				
				}
			};

			// get file by item
			$scope.getFileByItem = function(item){
				if (item.file_id){
					var i = File.determineItemTypeId(item);
					var query = File.generateGetFileQuery(item.file_id,item.cluster_id);
					Page.cmd("dbQuery",query,function(file){
						if (file.length > 0){
							item.file = file[0];
							item.file.cluster_id = item.cluster_id;
							if (item.cluster_id && item.cluster_id !== '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'){
								if (item.file.item_id) item.file.user_id = item.file.item_id.split('_')[1];
							}
							item = File.getFileMediaType(item,item.file.file_type,$scope.page.site_info.address,$scope.view);
							item.file.site_file = File.getSiteFileRecord(item.file,item.userId,$scope.site_files,$scope.config,$scope.sites,$scope.clusters);
							if (!item.file.site_file){
								$scope.forceFileDownload(item.file);
							}
						}
						$scope.$apply();
					});

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