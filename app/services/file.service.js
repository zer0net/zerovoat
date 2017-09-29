app.factory('File', [
	function() {

		var File = {};

		// NEW - REPLACE!
		// config file media type by file_type
		File.configFileMediaType = function(file){
			if (file.file_type === 'png' ||
				file.file_type === 'gif' ||
				file.file_type === 'jpeg'||
				file.file_type === 'jpg'){
				file.image = true;
			} else if (file.file_type === 'mp4' ||
			    file.file_type === 'mov' ||
			    file.file_type === 'mpeg'||
			    file.file_type === 'avi' ||
			    file.file_type === 'webm' ||
			    file.file_type === 'ogg') {
				file.video = true;
			} else if (file.file_type === 'mp3'){
				file.audio = true;
			}
			return file;			
		};

		// NEW - REPLACE!
		// render file media display
		File.renderFileMediaDisplay = function(file,config,address){
			// config cluster
			if (!file.cluster_id) file.cluster_id = config.cluster;
			// config media path & display
			if (file.image){
				
				if (file.data_uri) {
					file.image_path = file.data_uri;
				} else {
					file.image_path = 'merged-'+config.merger_name+'/' + file.cluster_id + '/data/users/' + file.user_id + '/' + file.file_name;
				}

			} else if (file.video || file.audio){

				// config source
				var source;
				if (file.data_uri) {
					source = file.data_uri;
				} else if (file.embed_url) {
					source = file.embed_url
				} else {
					source = 'merged-'+config.merger_name+'/' + file.cluster_id + '/data/users/' + file.user_id + '/' + file.file_name;
				}

				// config type
				var type;
				if (file.video) {
					type = 'video/'+file.file_type;
				} else if (file.audio) {
					type = 'audio/'+file.file_type;
				}

				file.player = {
					autoPlay:false,
					sources: [{
						src:source,
						type:type
					}],
					theme: "/" + address + "/assets/lib/videos/videogular-themes-default/videogular.css"
				};

			}
			
			return file;
		};

		// OLD - REPLACE!
		// get file media type
		File.getFileMediaType = function(item,file_type,address,view){
			var cluster_id;
			if (item.cluster_id){ cluster_id = item.cluster_id; } 
			else { cluster_id = '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'; }
			if (file_type === 'png' ||
				file_type === 'gif' ||
				file_type === 'jpeg'||
				file_type === 'jpg'){
				item.image = true;
				if (view !== 'new'){
					item.image_path = 'merged-CDN/' + cluster_id + '/data/users/' + item.file.user_id + '/' + item.file_name;
				}
			} else if (file_type === 'mp4' ||
			    file_type === 'mov' ||
			    file_type === 'mpeg'||
			    file_type === 'avi' ||
			    file_type === 'webm' ||
			    file_type === 'ogg') {
				item.video = true;
				var sources;
				if (item.file.data_uri){
					sources = [
						{
							src:item.file.data_uri,
							type:'video/'+file_type
						}
					];
				} else {
					sources = [
						{
							src:'merged-CDN/' + cluster_id + '/data/users/' + item.file.user_id + '/' + item.file_name,
							type:'video/'+file_type
						}
					];
				}
				item.player = {
					autoPlay:false,
					sources: sources,
					theme: "/" + address + "/assets/lib/videos/videogular-themes-default/videogular.css"
				};
			} else if (file_type === 'mp3'){
				item.audio = true;
			}
			return item;
		};

		// determine item id
		File.determineItemId = function(data,$scope,item){
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
				if ($scope.section === 'new'){
					if (!data.next_topic_id){
						item_id = 1;
					} else {
						item_id = data.next_topic_id;
					}
					item_id = $scope.page.site_info.auth_address + item_id.toString();
				} else if ($scope.section === 'edit') {

				} else {
					item_id = item.comment_id;
				}
			} else {
				item_id = item.comment_id;
			}
			return item_id;
		};

		// determine item type & id
		File.determineItemTypeId = function(item){
			var f = {};
			for (var i in item){
				if (i.indexOf('comment_id') > -1){
					f.is_comment = true;
				}
			}
			if (f.is_comment){
				f.item_type = 'comment';
				f.item_id = 'comment_id';
			} else {
				f.item_type = 'topic';
				f.item_id='topic_id';		
			}
			return f;
		};

		// get site files
		File.getSiteFiles = function(files,site_files,config,sites,address,section,clusters){
			files.forEach(function(file,index){
				file.site_file = File.getSiteFileRecord(file,file.user_id,site_files,config,sites,clusters);
				file = File.getMediaType(file,address);
			});
			return files;
		};

		// get file's site_file record
		File.getSiteFileRecord = function(file,userId,site_files,config,sites,clusters){
			var cluster_id;
			if (file.cluster_id){ cluster_id = file.cluster_id; } 
			else { cluster_id = config.cluster; }
			var site_file = {};
			clusters.forEach(function(cluster,index){
				if (cluster.cluster_id === cluster_id){
					cluster.files.forEach(function(s_file,index){
						if (s_file.inner_path.split('.')[1] !== 'json' && s_file.inner_path === 'data/users/' + file.user_id + '/' + file.file_name){
							site_file = s_file;
						}
						site_file.cluster_id = cluster_id;
						site_file.cluster_title = File.getClusterByAdress(cluster_id,sites);
					});
				}
			});
			return site_file;
		};

		// get embed file site_file record
		File.getEmbedSiteFileRecord = function(file,clusters,sites){
			var cluster_id = file.embed_url.split('/')[1];
			var path = file.embed_url.split(cluster_id + '/')[1];
			var site_file = {};
			console.log(cluster_id);
			console.log(path);
			clusters.forEach(function(cluster,index){
				if (cluster.cluster_id === cluster_id){
					cluster.files.forEach(function(s_file,index){
						if (s_file.inner_path === path){
							site_file = s_file;
						}
						site_file.cluster_id = cluster_id;
						site_file.cluster_title = File.getClusterByAdress(cluster_id,sites);					
					});
				}
			});
			return site_file;
		};

		// get media type
		File.getMediaType = function(file,address){
			if (file.file_type === 'png' ||
				file.file_type === 'gif' ||
				file.file_type === 'jpeg'||
				file.file_type === 'jpg'){
					file.image = true;
					file.image_path = 'merged-CDN/' + file.site_file.cluster_id + '/data/users/' + file.user_id + '/' + file.file_name;
			} else if (file.file_type === 'mp4' ||
			    file.file_type === 'mov' ||
			    file.file_type === 'mpeg'||
			    file.file_type === 'avi' ||
			    file.file_type === 'webm' ||
			    file.file_type === 'ogg') {
					file.video = true;
					var sources;
					sources = [
						{
							src:'merged-CDN/' + file.site_file.cluster_id + '/data/users/' + file.user_id + '/' + file.file_name,
							type:'video/'+file.file_type
						}
					];
				file.player = {
					autoPlay:false,
					sources: sources,
					theme: "/" + address + "/assets/lib/videos/videogular-themes-default/videogular.css"
				};
			} else if (file.file_type === 'mp3'){
				file.audio = true;
			}
			return file;
		};

		// get cluster by address
		File.getClusterByAdress = function(clusterId,sites){
			var c_title;
			sites.forEach(function(site,index){
				if (site.address === clusterId){
					c_title = site.content.title;
				}
			});
			return c_title;
		};

		// get file type
		File.getFileTypes = function(){
			var q = "SELECT distinct file_type";
			q += " FROM file";
			var query = [q];
			return query;
		};

		// render file types menu
		File.renderClustersMenu = function(clusters) {
			var cl_menu = [];
			clusters.forEach(function(cluster,index){
				cl_menu_item = {
					title:cluster.content.title,
					cluster_id:cluster.cluster_id
				}
				cl_menu.push(cl_menu_item);
			});
			return cl_menu;
		}

		// get file type
		File.getItemFileTypes = function(cluster_id){
			var q = "SELECT distinct file_type";
			q += " FROM item";
			var query = [q];
			return query;
		};

		// generate file count query
		File.generateFileCountQuery = function(user_id,file_type){
			var q = "SELECT count(*)";
			q += " FROM file AS f";
			q += " WHERE f.file_id IS NOT NULL";
			if (file_type) q += " AND f.file_type='"+file_type+"'";			
			var query = [q];
			return query;
		};

		// generate item as file count query
		File.generateItemAsFileCountQuery = function(user_id,file_type){
			var q = "SELECT count(*)";
			q += " FROM item AS it";
			q += " WHERE it.item_id IS NOT NULL";
			if (file_type) q += " AND it.file_type='"+file_type+"'";			
			var query = [q];
			return query;
		};

		// generate file browser query
		File.generateFileBrowserQuery = function(pagination,user_id,file_type,cluster_id){
			var q = "SELECT f.*";
			q += " FROM file AS f";
			q += " WHERE f.file_id IS NOT NULL";
			if (file_type) q += " AND f.file_type='"+file_type+"'";
			q += " ORDER BY -f.added";
			q += " LIMIT 12";
			if (pagination) q += " OFFSET "+(pagination.currentPage * 12);
			var query = [q];
			return query;
		};

		// genearte ifs item as file query
		File.generateItemAsFileQuery = function(pagination,user_id,file_type,cluster_id){
			var q = "SELECT it.file_name, it.item_id as file_id, it.file_size, it.file_type, it.date_added as added, it.channel, ch.user_id, ch.cluster_id";
			q += " FROM item AS it";
			q += " JOIN channel AS ch ON it.channel=ch.channel_address"
			q += " WHERE it.item_id IS NOT NULL";
			if (cluster_id) q += " AND ch.cluster_id='"+cluster_id+"'";
			if (file_type) q += " AND it.file_type='"+file_type+"'";
			q += " ORDER BY -it.date_added";
			q += " LIMIT 12";
			if (pagination) q += " OFFSET "+(pagination.currentPage * 12);			
			var query = [q];
			return query;
		};

		// generate get file query 
		File.generateGetFileQuery = function(fileId,clusterId){
			var q = "SELECT f.* ";
			if (clusterId && clusterId !== '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'){
				q += " FROM item AS f WHERE f.item_id='"+fileId+"'";
			} else {
				q += " FROM file AS f WHERE f.file_id='"+fileId+"'";
			}
			var query = [q];
			return query;
		};

		return File;
		
	}
]);