app.factory('File', [
	function() {

		var File = {};

		// get file media type
		File.getFileMediaType = function(item,address,view){
			if (item.file.file_type === 'png' ||
				item.file.file_type === 'gif' ||
				item.file.file_type === 'jpeg'||
				item.file.file_type === 'jpg'){
				item.image = true;
				item.image_path = '/' + address + '/data/users/' + item.file.user_id + '/' + item.file.file_name;
			} else if (item.file.file_type === 'mp4' ||
			    item.file.file_type === 'mov' ||
			    item.file.file_type === 'mpeg'||
			    item.file.file_type === 'avi' ||
			    item.file.file_type === 'ogg') {
				item.video = true;
				var sources;
				if (view === 'new'){
					sources = [
						{
							src:item.file.data_uri,
							type:'video/'+item.file.file_type
						}
					];
				} else {
					sources = [
						{
							src:'/' + address + '/data/users/' + item.file.user_id + '/' + item.file.file_name,
							type:'video/'+item.file.file_type
						}
					];
				}
				item.player = {
					autoPlay:false,
					sources: sources,
					theme: "/" + address + "/assets/lib/videos/videogular-themes-default/videogular.css"
				};
			}
			return item;
		};

		// determine item id
		File.determineItemId = function(data,$scope){
			var item_id;
			if ($scope.item_type === 'channel'){
				if (!data.next_channel_id){
					item_id = 1;
				} else {
					item_id = data.next_channel_id;
				}
				item_id = $scope.page.site_info.auth_address + item_id.toString();
			} else if ($scope.item_type === 'layout'){
				if ($scope.mode === 'new'){
					if (!data.next_channel_layout_id){
						item_id = 1;
					} else {
						item_id = data.next_channel_layout_id;
					}
					item_id = $scope.page.site_info.auth_address + item_id.toString();
				} else {
					item_id = $scope.layout.channel_layout_id;
				}
			} else if ($scope.item_type === 'topic'){
				if ($scope.view === 'new'){
					if (!data.next_topic_id){
						item_id = 1;
					} else {
						item_id = data.next_topic_id;
					}
					item_id = $scope.page.site_info.auth_address + item_id.toString();
				} else {
					item_id = $scope.topic.topic_id;
				}
			}
			return item_id;
		};

		// determine item type & id
		File.determineItemTypeId = function(item){
			var f = {};
			for (var i in item){
				if (i.indexOf('comment_id') > -1){
					f.item_type = 'comment';
					f.item_id = 'comment_id';
				} else if (i.indexOf('topic_id') > -1){
					f.item_type = 'topic';
					f.item_id='topic_id';
				}
			}
			return f;
		};

		return File;
		
	}
]);